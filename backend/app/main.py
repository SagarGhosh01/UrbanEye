from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from .core.config import settings
from .db.database import engine, Base, AsyncSessionLocal
from .services.fleet import seed_initial_data
from .services.realtime import manager
from .api.routes import auth, events, fleet, analytics, anpr, simulator, phone, tickets, explainability

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("UrbanEye.Backend")

import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing UrbanEye Database and Seed Data...")
    db_url = settings.DATABASE_URL
    if "sqlite" in db_url:
        try:
            db_path = db_url.split("///")[-1]
            db_dir = os.path.dirname(db_path)
            if db_dir:
                os.makedirs(db_dir, exist_ok=True)
        except Exception as e:
            logger.warning(f"Could not prepare database directory: {e}")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)
    logger.info("UrbanEye Backend ready for ingestion & telemetry streaming.")
    yield
    logger.info("UrbanEye Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade AI-Powered Mobile Urban Intelligence Platform for Bharat Electronics Limited (BEL)",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication & RBAC"])
app.include_router(events.router, prefix=f"{settings.API_V1_STR}/events", tags=["Events & Ingestion"])
app.include_router(fleet.router, prefix=f"{settings.API_V1_STR}/fleet", tags=["Fleet & Hardware Telemetry"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics, Heatmaps & KPIs"])
app.include_router(anpr.router, prefix=f"{settings.API_V1_STR}/anpr", tags=["ANPR & Law Enforcement Review"])
app.include_router(simulator.router, prefix=f"{settings.API_V1_STR}/simulator", tags=["Demo & Scenario Simulator"])
app.include_router(phone.router, prefix=f"{settings.API_V1_STR}/phone", tags=["Phone-as-Bus-Camera Live ML Stream"])
app.include_router(tickets.router, prefix=f"{settings.API_V1_STR}/tickets", tags=["Municipal Work-Order Tickets & Consensus"])
app.include_router(explainability.router, prefix=f"{settings.API_V1_STR}/explainability", tags=["Grad-CAM & Saliency Explainability"])

@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "UrbanEye Central Platform",
        "version": settings.VERSION,
        "database": "CONNECTED",
        "active_ws_clients": len(manager.active_connections)
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep-alive ping/pong receiver
            data = await websocket.receive_text()
            # Can process client commands (e.g. subscribe to specific bus)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
