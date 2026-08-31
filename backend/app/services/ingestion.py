from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import json
import logging
from ..db.models import Event, Bus, ANPRRecord, RoadSegment, BandwidthMetric, EdgeDevice
from ..schemas.events import EventCreate
from .realtime import manager
from ..core.config import settings

logger = logging.getLogger("UrbanEye.Ingestion")

async def process_incoming_event(event_data: EventCreate, db: AsyncSession) -> Event:
    # 1. Check if event already exists (deduplication for store-and-forward)
    existing = await db.get(Event, event_data.event_id)
    if existing:
        logger.info(f"Duplicate event {event_data.event_id} skipped.")
        return existing

    # 2. Extract and format fields
    evidence_thumb = event_data.evidence.thumbnail_base64 if event_data.evidence else None
    evidence_clip = event_data.evidence.clip_url if event_data.evidence else None
    
    metadata_dict = event_data.metadata.dict() if event_data.metadata else {}
    
    # 3. Create Event record
    db_event = Event(
        event_id=event_data.event_id,
        type=event_data.type.value,
        confidence=event_data.confidence,
        timestamp=event_data.timestamp,
        lat=event_data.location.lat if event_data.location else None,
        lng=event_data.location.lng if event_data.location else None,
        accuracy_m=event_data.location.accuracy_m if event_data.location else 5.0,
        bus_id=event_data.bus_id,
        camera_id=event_data.camera_id,
        severity=event_data.severity.value,
        status=event_data.status.value,
        evidence_thumbnail=evidence_thumb,
        evidence_clip_url=evidence_clip,
        metadata_json=metadata_dict
    )
    db.add(db_event)

    # 4. Handle ANPR if present
    if event_data.anpr_plate or event_data.type.value == "ANPR_ALERT":
        plate_no = event_data.anpr_plate
        # Zero fabrication rule: if plate_no is "Not readable" or confidence low
        ocr_conf = event_data.anpr_confidence or 0.0
        db_anpr = ANPRRecord(
            event_id=event_data.event_id,
            registration_no=plate_no,
            ocr_confidence=ocr_conf,
            vehicle_type=metadata_dict.get("vehicle_type", "CAR"),
            is_flagged=metadata_dict.get("is_flagged", False),
            flag_reason=metadata_dict.get("flag_reason", None)
        )
        db.add(db_anpr)

    # 5. Update Bus last known position & status
    bus = await db.get(Bus, event_data.bus_id)
    if bus and event_data.location and event_data.location.lat is not None:
        bus.current_lat = event_data.location.lat
        bus.current_lng = event_data.location.lng
        bus.last_seen = datetime.utcnow()

    # 6. Update Road Segment condition if applicable
    if event_data.location and event_data.location.lat and event_data.type.value in ["POTHOLE", "WATERLOGGING"]:
        # Find nearest road segment
        segments_res = await db.execute(select(RoadSegment))
        segments = segments_res.scalars().all()
        for seg in segments:
            # Simple bounding box distance approximation
            min_lat = min(seg.start_lat, seg.end_lat) - 0.005
            max_lat = max(seg.start_lat, seg.end_lat) + 0.005
            min_lng = min(seg.start_lng, seg.end_lng) - 0.005
            max_lng = max(seg.start_lng, seg.end_lng) + 0.005
            if min_lat <= event_data.location.lat <= max_lat and min_lng <= event_data.location.lng <= max_lng:
                if event_data.type.value == "POTHOLE":
                    seg.pothole_count += 1
                    seg.condition_score = max(10.0, seg.condition_score - 4.5)
                elif event_data.type.value == "WATERLOGGING":
                    seg.waterlogging_count += 1
                    seg.condition_score = max(10.0, seg.condition_score - 6.0)
                
                if seg.condition_score < 50.0:
                    seg.maintenance_priority = "URGENT"
                elif seg.condition_score < 75.0:
                    seg.maintenance_priority = "WATCHLIST"
                seg.last_inspected = datetime.utcnow()
                break

    # 7. Calculate Bandwidth savings metrics
    # Event payload size in bytes
    payload_str = json.dumps(event_data.dict(), default=str)
    actual_bytes = len(payload_str.encode('utf-8'))
    # Estimated raw 1080p video duration represented by this event (e.g. 5 sec buffer @ 4.5 Mbps = ~2.81 MB)
    raw_video_bytes_est = (settings.RAW_VIDEO_BITRATE_KBPS * 1024 / 8) * 5.0
    
    bw_metric = BandwidthMetric(
        raw_video_bytes=raw_video_bytes_est,
        actual_edge_bytes=actual_bytes,
        savings_percentage=round((1.0 - (actual_bytes / raw_video_bytes_est)) * 100.0, 2),
        events_transmitted=1
    )
    db.add(bw_metric)

    await db.commit()
    await db.refresh(db_event)

    # 8. Broadcast over WebSocket in real time
    broadcast_data = {
        "channel": "events",
        "action": "new_event",
        "data": {
            "event_id": db_event.event_id,
            "type": db_event.type,
            "confidence": db_event.confidence,
            "timestamp": db_event.timestamp.isoformat(),
            "location": {
                "lat": db_event.lat,
                "lng": db_event.lng,
                "accuracy_m": db_event.accuracy_m,
                "status": "LOCKED" if db_event.lat else "UNAVAILABLE",
                "resolved_address": event_data.location.resolved_address if event_data.location else None,
                "road_name": event_data.location.road_name if event_data.location else None,
                "locality": event_data.location.locality if event_data.location else None,
                "city": event_data.location.city if event_data.location else "New Delhi",
                "postal_code": event_data.location.postal_code if event_data.location else None,
                "maps_url": event_data.location.maps_url if event_data.location else (f"https://www.google.com/maps?q={db_event.lat},{db_event.lng}" if db_event.lat else None)
            },
            "bus_id": db_event.bus_id,
            "camera_id": db_event.camera_id,
            "severity": db_event.severity,
            "status": db_event.status,
            "evidence": {
                "thumbnail_base64": db_event.evidence_thumbnail,
                "clip_url": db_event.evidence_clip_url
            },
            "metadata": db_event.metadata_json,
            "anpr": {
                "plate": event_data.anpr_plate,
                "confidence": event_data.anpr_confidence
            } if event_data.anpr_plate else None
        }
    }
    await manager.broadcast(broadcast_data)
    
    return db_event
