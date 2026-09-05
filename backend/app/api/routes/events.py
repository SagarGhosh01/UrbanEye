from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from ...db.database import get_db
from ...db.models import Event, User
from ...schemas.events import EventCreate, EventResponse, EventStatusUpdate
from ...services.ingestion import process_incoming_event
from ..deps import get_current_user

router = APIRouter()

@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_event(
    event_data: EventCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingestion endpoint for edge units to transmit detected events.
    Supports honest reporting: handles 'GPS unavailable' or 'Not readable' plates safely.
    """
    event = await process_incoming_event(event_data, db)
    return {"status": "SUCCESS", "event_id": event.event_id}

@router.post("/batch-ingest", status_code=status.HTTP_201_CREATED)
async def batch_ingest_events(
    events_data: List[EventCreate],
    db: AsyncSession = Depends(get_db)
):
    """
    Store-and-Forward synchronization endpoint for edge units reconnecting after cellular drop.
    """
    synced_ids = []
    for event_item in events_data:
        ev = await process_incoming_event(event_item, db)
        synced_ids.append(ev.event_id)
        
    return {
        "status": "SUCCESS",
        "synced_count": len(synced_ids),
        "synced_event_ids": synced_ids
    }

@router.get("", response_model=List[EventResponse])
async def list_events(
    type: Optional[str] = Query(None, description="Filter by event type"),
    severity: Optional[str] = Query(None, description="Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)"),
    status: Optional[str] = Query(None, description="Filter by status (NEW, REVIEWED, DISPATCHED, RESOLVED)"),
    bus_id: Optional[str] = Query(None, description="Filter by bus identifier"),
    state_id: Optional[str] = Query(None, description="Filter by state ID (e.g. RJ, DL, MH)"),
    district_id: Optional[str] = Query(None, description="Filter by district ID (e.g. RJ-14, DL-01)"),
    state_name: Optional[str] = Query(None, description="Filter by state name"),
    district_name: Optional[str] = Query(None, description="Filter by district name"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    query = select(Event).order_by(Event.timestamp.desc())
    
    if type:
        query = query.where(Event.type == type)
    if severity:
        query = query.where(Event.severity == severity)
    if status:
        query = query.where(Event.status == status)
    if bus_id:
        query = query.where(Event.bus_id == bus_id)
    if state_id:
        query = query.where(Event.state_id == state_id)
    if district_id:
        query = query.where(Event.district_id == district_id)
    if state_name and state_name != "All States":
        query = query.where(Event.state_name == state_name)
    if district_name and district_name != "All Districts":
        query = query.where(Event.district_name == district_name)
        
    query = query.limit(limit).offset(offset)
    res = await db.execute(query)
    events = res.scalars().all()
    
    results = []
    for e in events:
        results.append(EventResponse(
            event_id=e.event_id,
            type=e.type,
            confidence=e.confidence,
            timestamp=e.timestamp,
            location={
                "lat": e.lat,
                "lng": e.lng,
                "accuracy_m": e.accuracy_m,
                "status": "LOCKED" if e.lat is not None else "UNAVAILABLE"
            },
            bus_id=e.bus_id,
            camera_id=e.camera_id,
            severity=e.severity,
            status=e.status,
            evidence={
                "thumbnail_base64": e.evidence_thumbnail,
                "clip_url": e.evidence_clip_url
            },
            metadata=e.metadata_json or {}
        ))
    return results

@router.get("/{event_id}", response_model=EventResponse)
async def get_event_detail(
    event_id: str,
    db: AsyncSession = Depends(get_db)
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    return EventResponse(
        event_id=event.event_id,
        type=event.type,
        confidence=event.confidence,
        timestamp=event.timestamp,
        location={
            "lat": event.lat,
            "lng": event.lng,
            "accuracy_m": event.accuracy_m,
            "status": "LOCKED" if event.lat is not None else "UNAVAILABLE"
        },
        bus_id=event.bus_id,
        camera_id=event.camera_id,
        severity=event.severity,
        status=event.status,
        evidence={
            "thumbnail_base64": event.evidence_thumbnail,
            "clip_url": event.evidence_clip_url
        },
        metadata=event.metadata_json or {}
    )

@router.get("/db-stats/summary")
async def get_db_stats(
    state_id: Optional[str] = Query(None),
    district_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns live database audit statistics showing real stored records, with optional district filtering.
    """
    from ...db.models import Event, ANPRRecord, VehicleCountSnapshot, Bus, RoadSegment
    from sqlalchemy import func

    evt_q = select(func.count()).select_from(Event)
    if state_id:
        evt_q = evt_q.where(Event.state_id == state_id)
    if district_id:
        evt_q = evt_q.where(Event.district_id == district_id)

    events_count = (await db.execute(evt_q)).scalar() or 0
    anpr_count = (await db.execute(select(func.count()).select_from(ANPRRecord))).scalar() or 0
    vehicle_snapshots_count = (await db.execute(select(func.count()).select_from(VehicleCountSnapshot))).scalar() or 0
    buses_count = (await db.execute(select(func.count()).select_from(Bus))).scalar() or 0
    segments_count = (await db.execute(select(func.count()).select_from(RoadSegment))).scalar() or 0

    return {
        "database": "SQLite / PostgreSQL Production Database",
        "status": "ONLINE & PERSISTING",
        "filtered_state": state_id or "All States",
        "filtered_district": district_id or "All Districts",
        "total_webcam_events_stored": events_count,
        "total_anpr_plates_stored": anpr_count,
        "total_vehicle_snapshots_stored": vehicle_snapshots_count,
        "active_bus_sensors": buses_count,
        "monitored_road_segments": segments_count
    }

@router.patch("/{event_id}/status")
async def update_event_status(
    event_id: str,
    status_update: EventStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    event.status = status_update.status.value
    await db.commit()
    return {"status": "SUCCESS", "event_id": event_id, "new_status": event.status}
