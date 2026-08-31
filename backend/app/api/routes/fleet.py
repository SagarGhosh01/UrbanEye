from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ...db.database import get_db
from ...db.models import Bus, EdgeDevice, VehicleCountSnapshot
from ...schemas.fleet import BusTelemetry, EdgeDeviceTelemetry, VehicleSnapshotCreate
from ...services.fleet import update_bus_telemetry
from ...services.realtime import manager

router = APIRouter()

@router.get("/buses", response_model=List[BusTelemetry])
async def list_buses(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Bus))
    buses = res.scalars().all()
    return buses

@router.get("/devices", response_model=List[EdgeDeviceTelemetry])
async def list_edge_devices(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(EdgeDevice))
    devices = res.scalars().all()
    return devices

@router.post("/telemetry")
async def post_telemetry(
    bus_id: str,
    lat: float,
    lng: float,
    speed_kmh: float = 0.0,
    heading_deg: float = 0.0,
    db: AsyncSession = Depends(get_db)
):
    await update_bus_telemetry(bus_id, lat, lng, speed_kmh, heading_deg, db)
    return {"status": "SUCCESS"}

@router.post("/vehicle-snapshot", status_code=status.HTTP_201_CREATED)
async def post_vehicle_snapshot(
    snapshot: VehicleSnapshotCreate,
    db: AsyncSession = Depends(get_db)
):
    db_snap = VehicleCountSnapshot(
        bus_id=snapshot.bus_id,
        timestamp=snapshot.timestamp,
        lat=snapshot.lat,
        lng=snapshot.lng,
        cars=snapshot.cars,
        motorcycles=snapshot.motorcycles,
        buses=snapshot.buses,
        trucks=snapshot.trucks,
        auto_rickshaws=snapshot.auto_rickshaws,
        pedestrians=snapshot.pedestrians,
        total_vehicles=snapshot.total_vehicles,
        density_level=snapshot.density_level
    )
    db.add(db_snap)
    await db.commit()
    
    # Broadcast snapshot for real-time traffic density update
    await manager.broadcast({
        "channel": "traffic",
        "action": "snapshot",
        "data": snapshot.dict()
    })
    return {"status": "SUCCESS"}
