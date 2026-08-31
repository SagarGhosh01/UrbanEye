from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import random
import uuid
from datetime import datetime
from ...db.database import get_db
from ...db.models import Bus, Event, RoadSegment, EdgeDevice
from ...schemas.events import EventCreate, EventType, EventSeverity, EventStatus, LocationSchema, EvidenceSchema, EventMetadataSchema
from ...services.ingestion import process_incoming_event
from ...services.fleet import update_bus_telemetry
from ...services.realtime import manager

router = APIRouter()

SAMPLE_PLATES = ["DL-3CAY-8921", "DL-8CNA-4412", "HR-26DK-9102", "UP-16BW-3390", "DL-1V-7711"]

@router.post("/inject-hazard")
async def inject_simulated_hazard(
    hazard_type: str = "POTHOLE",
    severity: str = "HIGH",
    bus_id: str = "BUS-101",
    db: AsyncSession = Depends(get_db)
):
    bus = await db.get(Bus, bus_id)
    lat = bus.current_lat if bus and bus.current_lat else 28.5680
    lng = bus.current_lng if bus and bus.current_lng else 77.2340
    
    # Add slight jitter to simulate precise hazard coordinate on road
    lat += (random.random() - 0.5) * 0.002
    lng += (random.random() - 0.5) * 0.002

    event_id = f"EVT-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(100000, 999999)}"
    
    plate = random.choice(SAMPLE_PLATES) if hazard_type in ["NEAR_MISS", "ANPR_ALERT", "ILLEGAL_PARKING"] else None
    
    event_payload = EventCreate(
        event_id=event_id,
        type=EventType(hazard_type),
        confidence=round(random.uniform(0.86, 0.98), 2),
        timestamp=datetime.utcnow(),
        location=LocationSchema(lat=lat, lng=lng, accuracy_m=4.2, status="LOCKED"),
        bus_id=bus_id,
        camera_id="FRONT",
        severity=EventSeverity(severity),
        status=EventStatus.NEW,
        evidence=EvidenceSchema(
            thumbnail_base64=None,
            clip_url=f"/evidence/clips/{event_id}.mp4"
        ),
        metadata=EventMetadataSchema(
            model_version="yolov8n-urbaneye-v3.2",
            edge_device_id=f"EDGE-{bus_id.split('-')[1]}",
            bounding_boxes=[
                {"label": hazard_type.lower(), "bbox": [140, 220, 310, 410], "conf": 0.93}
            ],
            extra={"road_surface": "Asphalt", "weather": "Clear daylight"}
        ),
        anpr_plate=plate,
        anpr_confidence=0.91 if plate else None
    )
    
    saved_event = await process_incoming_event(event_payload, db)
    return {"status": "SUCCESS", "injected_event_id": saved_event.event_id, "type": hazard_type}

@router.post("/tick-fleet")
async def step_fleet_movement(db: AsyncSession = Depends(get_db)):
    """
    Steps all active buses along realistic transit routes in the city.
    """
    res = await db.execute(select(Bus))
    buses = res.scalars().all()
    
    updated = []
    for b in buses:
        # Move along heading with small Brownian variation
        step = 0.0008  # ~80m per tick
        delta_lat = (random.random() - 0.48) * step
        delta_lng = (random.random() - 0.48) * step
        
        new_lat = (b.current_lat or 28.6000) + delta_lat
        new_lng = (b.current_lng or 77.2000) + delta_lng
        new_speed = max(15.0, min(55.0, b.speed_kmh + random.uniform(-4.0, 4.0)))
        
        await update_bus_telemetry(b.bus_id, new_lat, new_lng, round(new_speed, 1), b.heading_deg, db)
        updated.append({"bus_id": b.bus_id, "lat": new_lat, "lng": new_lng, "speed": new_speed})
        
    return {"status": "SUCCESS", "buses_stepped": len(updated), "telemetry": updated}

@router.post("/toggle-network")
async def toggle_edge_network_state(
    device_id: str = "EDGE-101",
    simulate_offline: bool = True,
    db: AsyncSession = Depends(get_db)
):
    dev = await db.get(EdgeDevice, device_id)
    if dev:
        dev.status = "BUFFERING_OFFLINE" if simulate_offline else "ONLINE"
        if simulate_offline:
            dev.buffered_events_count += 5
        else:
            dev.buffered_events_count = 0
        await db.commit()
        
        await manager.broadcast({
            "channel": "device",
            "action": "status_change",
            "data": {
                "device_id": dev.device_id,
                "status": dev.status,
                "buffered_events_count": dev.buffered_events_count
            }
        })
    return {"status": "SUCCESS", "device_id": device_id, "new_status": dev.status if dev else "NOT_FOUND"}
