from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import base64
import uuid
import datetime
import logging
from ...db.database import get_db
from ...services.real_vision import vision_pipeline
from ...services.ingestion import process_incoming_event
from ...services.fleet import update_bus_telemetry
from ...services.realtime import manager
from ...schemas.events import EventCreate, EventType, EventSeverity, EventStatus, LocationSchema, EvidenceSchema, EventMetadataSchema

router = APIRouter()
logger = logging.getLogger("UrbanEye.PhoneAPI")

@router.post("/process-frame")
async def process_phone_frame(
    file: UploadFile = File(...),
    bus_id: str = Form("BUS-101"),
    lat: float = Form(None),
    lng: float = Form(None),
    accuracy_m: float = Form(5.0),
    speed_kmh: float = Form(0.0),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives live camera frames from the user's phone acting as a bus front-view camera.
    Runs real YOLOv8 object detection, ByteTrack tracking, OCR plate recognition,
    and road pothole detection, streaming results live to the central command dashboard.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty frame")

    # Run Real ML Pipeline
    result = vision_pipeline.process_frame(contents)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Update Bus GPS telemetry if coordinates provided
    if lat is not None and lng is not None:
        await update_bus_telemetry(bus_id, lat, lng, speed_kmh, 0.0, db)

    # Broadcast live camera stream & bounding boxes to all connected dashboard viewers
    await manager.broadcast({
        "channel": "live_feed",
        "action": "phone_frame",
        "data": {
            "bus_id": bus_id,
            "annotated_frame": result["annotated_frame"],
            "detections": result["detections"],
            "counts": result["counts"],
            "total_vehicles": result["total_counted_cumulative"],
            "anpr_results": result["anpr_results"],
            "hazards": result["hazards"],
            "latency_ms": result["latency_ms"],
            "gps": {
                "lat": lat,
                "lng": lng,
                "status": "LOCKED" if lat is not None else "UNAVAILABLE"
            }
        }
    })

    # If any real road hazard was detected in this frame, persist structured Event
    for hz in result["hazards"]:
        event_id = f"EVT-PHONE-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
        event_payload = EventCreate(
            event_id=event_id,
            type=EventType(hz["type"]),
            confidence=hz["confidence"],
            timestamp=datetime.datetime.utcnow(),
            location=LocationSchema(
                lat=lat,
                lng=lng,
                accuracy_m=accuracy_m,
                status="LOCKED" if lat is not None else "UNAVAILABLE"
            ),
            bus_id=bus_id,
            camera_id="PHONE_FRONT",
            severity=EventSeverity(hz["severity"]),
            status=EventStatus.NEW,
            evidence=EvidenceSchema(thumbnail_base64=result["annotated_frame"]),
            metadata=EventMetadataSchema(
                model_version="yolov8n-phone-edge",
                edge_device_id="MOBILE-PHONE-CAM",
                bounding_boxes=[{"label": hz["type"].lower(), "bbox": hz["bbox"], "conf": hz["confidence"]}]
            )
        )
        await process_incoming_event(event_payload, db)

    # If license plate was detected via OCR, persist ANPR record
    for anpr in result["anpr_results"]:
        event_id = f"EVT-ANPR-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
        event_payload = EventCreate(
            event_id=event_id,
            type=EventType.ANPR_ALERT,
            confidence=anpr["confidence"],
            timestamp=datetime.datetime.utcnow(),
            location=LocationSchema(lat=lat, lng=lng, accuracy_m=accuracy_m, status="LOCKED" if lat is not None else "UNAVAILABLE"),
            bus_id=bus_id,
            camera_id="PHONE_FRONT",
            severity=EventSeverity.MEDIUM,
            status=EventStatus.NEW,
            evidence=EvidenceSchema(thumbnail_base64=result["annotated_frame"]),
            metadata=EventMetadataSchema(
                model_version="easyocr-plate-v1",
                edge_device_id="MOBILE-PHONE-CAM"
            ),
            anpr_plate=anpr["plate"],
            anpr_confidence=anpr["confidence"]
        )
        await process_incoming_event(event_payload, db)

    return result
