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
from ...services.geocoding import geocoding_service
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
    accel_z_spike: float = Form(0.0),
    compass_heading: float = Form(0.0),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives high-resolution live camera frames and IMU sensor telemetry from the user's phone.
    Runs real YOLOv8 tracking, HSRP OCR ANPR, IMU-fused Pothole Detection, and High-Accuracy Reverse Geocoding.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty frame")

    sensor_motion = {
        "accel_z_spike": accel_z_spike,
        "compass_heading": compass_heading
    }

    # Run Enhanced Multi-Modal ML Pipeline
    result = vision_pipeline.process_frame(contents, sensor_motion=sensor_motion)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # High-Accuracy Address Resolution
    geo_info = await geocoding_service.get_address(lat, lng)

    # Update Bus GPS telemetry if coordinates provided
    if lat is not None and lng is not None:
        await update_bus_telemetry(bus_id, lat, lng, speed_kmh, compass_heading, db)

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
                "accuracy_m": accuracy_m,
                "status": "LOCKED" if lat is not None else "UNAVAILABLE",
                "speed_kmh": speed_kmh,
                "address": geo_info["formatted_address"],
                "road": geo_info["road"],
                "suburb": geo_info["suburb"],
                "maps_url": geo_info["maps_url"]
            },
            "imu": sensor_motion
        }
    })

    # If any real road hazard was detected in this frame, persist structured Event with exact address
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
                status="LOCKED" if lat is not None else "UNAVAILABLE",
                resolved_address=geo_info["formatted_address"],
                road_name=geo_info["road"],
                locality=geo_info["suburb"],
                city=geo_info["city"],
                postal_code=geo_info["postcode"],
                maps_url=geo_info["maps_url"]
            ),
            bus_id=bus_id,
            camera_id="PHONE_FRONT",
            severity=EventSeverity(hz["severity"]),
            status=EventStatus.NEW,
            evidence=EvidenceSchema(thumbnail_base64=result["annotated_frame"]),
            metadata=EventMetadataSchema(
                model_version="yolov8n-multimodal-v2",
                edge_device_id="MOBILE-PHONE-CAM",
                bounding_boxes=[{"label": hz["type"].lower(), "bbox": hz["bbox"], "conf": hz["confidence"]}],
                extra={
                    "imu_bump_confirmed": hz.get("imu_confirmed", False),
                    "geocoded_address": geo_info["formatted_address"]
                }
            )
        )
        await process_incoming_event(event_payload, db)

    # If license plate was detected via OCR, persist ANPR record with address
    for anpr in result["anpr_results"]:
        event_id = f"EVT-ANPR-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
        event_payload = EventCreate(
            event_id=event_id,
            type=EventType.ANPR_ALERT,
            confidence=anpr["confidence"],
            timestamp=datetime.datetime.utcnow(),
            location=LocationSchema(
                lat=lat,
                lng=lng,
                accuracy_m=accuracy_m,
                status="LOCKED" if lat is not None else "UNAVAILABLE",
                resolved_address=geo_info["formatted_address"],
                road_name=geo_info["road"],
                locality=geo_info["suburb"],
                city=geo_info["city"],
                postal_code=geo_info["postcode"],
                maps_url=geo_info["maps_url"]
            ),
            bus_id=bus_id,
            camera_id="PHONE_FRONT",
            severity=EventSeverity.MEDIUM,
            status=EventStatus.NEW,
            evidence=EvidenceSchema(thumbnail_base64=result["annotated_frame"]),
            metadata=EventMetadataSchema(
                model_version="easyocr-hsrp-v2",
                edge_device_id="MOBILE-PHONE-CAM",
                extra={
                    "standard": anpr.get("standard", "Indian HSRP"),
                    "geocoded_address": geo_info["formatted_address"]
                }
            ),
            anpr_plate=anpr["plate"],
            anpr_confidence=anpr["confidence"]
        )
        await process_incoming_event(event_payload, db)

    return {
        **result,
        "geocoding": geo_info
    }
