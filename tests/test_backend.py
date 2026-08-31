import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.core.security import create_access_token
from backend.app.db.database import engine, Base, AsyncSessionLocal
from backend.app.services.fleet import seed_initial_data

@pytest.fixture(autouse=True)
async def init_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["service"] == "UrbanEye Central Platform"

@pytest.mark.asyncio
async def test_list_buses_and_devices():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        bus_resp = await ac.get("/api/v1/fleet/buses")
        dev_resp = await ac.get("/api/v1/fleet/devices")
    assert bus_resp.status_code == 200
    assert len(bus_resp.json()) >= 5
    assert dev_resp.status_code == 200
    assert len(dev_resp.json()) >= 5

@pytest.mark.asyncio
async def test_event_ingestion_and_query():
    event_payload = {
        "event_id": "TEST-EVT-001",
        "type": "POTHOLE",
        "confidence": 0.94,
        "location": {"lat": 28.5680, "lng": 77.2340, "accuracy_m": 4.5, "status": "LOCKED"},
        "bus_id": "BUS-101",
        "camera_id": "FRONT",
        "severity": "HIGH",
        "status": "NEW",
        "metadata": {
            "model_version": "yolov8n-urbaneye-v3.2",
            "edge_device_id": "EDGE-101"
        }
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        ingest_resp = await ac.post("/api/v1/events/ingest", json=event_payload)
        assert ingest_resp.status_code == 201
        
        get_resp = await ac.get("/api/v1/events/TEST-EVT-001")
        assert get_resp.status_code == 200
        ev = get_resp.json()
        assert ev["event_id"] == "TEST-EVT-001"
        assert ev["type"] == "POTHOLE"
        assert ev["confidence"] == 0.94

@pytest.mark.asyncio
async def test_anpr_rbac_restriction():
    viewer_token = create_access_token(subject="viewer", role="viewer")
    police_token = create_access_token(subject="traffic_police", role="law_enforcement_liaison")
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Viewer should be forbidden (403)
        res_viewer = await ac.get(
            "/api/v1/anpr/records",
            headers={"Authorization": f"Bearer {viewer_token}"}
        )
        assert res_viewer.status_code == 403
        
        # Police liaison should be allowed (200)
        res_police = await ac.get(
            "/api/v1/anpr/records",
            headers={"Authorization": f"Bearer {police_token}"}
        )
        assert res_police.status_code == 200
