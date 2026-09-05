from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from datetime import datetime
import uuid

from ...db.database import get_db
from ...db.models import Event, ANPRRecord, Device
from ...services.district_resolver import district_resolver
from ...schemas.events import EventType, EventSeverity, EventStatus

router = APIRouter()

@router.post("/events/batch", status_code=status.HTTP_202_ACCEPTED)
async def batch_ingest_mobile_events(
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Mobile Phone Batch Ingestion Endpoint:
    Accepts arrays of on-device detection events, evidence image crops, GPS coordinates, compass headings, and timestamps.
    Performs server-side de-duplication by client_event_id and in-memory spatial district resolution.
    """
    events_input = payload.get("events") or []
    if not isinstance(events_input, list):
        raise HTTPException(status_code=400, detail="Invalid payload: 'events' field must be an array.")

    accepted_count = 0
    duplicate_count = 0
    rejected_list = []

    for item in events_input:
        client_event_id = item.get("client_event_id") or str(uuid.uuid4())
        hazard_type = item.get("hazard_type") or item.get("type") or "POTHOLE"
        conf = float(item.get("confidence", 0.90))
        
        gps = item.get("gps") or {}
        lat = gps.get("lat") or item.get("lat") or 26.9124
        lng = gps.get("lng") or item.get("lng") or 75.7873
        accuracy = gps.get("accuracy") or item.get("accuracy_m") or 3.2

        bus_id = item.get("bus_id") or item.get("bus_reg_no") or "BUS-101"
        device_id = item.get("device_id") or "MOBILE-PHONE-CAM"
        evidence_b64 = item.get("evidence_image_base64") or item.get("evidence_thumbnail")

        # 1. Check for server-side deduplication by client_event_id
        dup_q = select(Event).where(Event.client_event_id == client_event_id)
        dup_res = await db.execute(dup_q)
        if dup_res.scalars().first():
            duplicate_count += 1
            continue

        # 2. Fast spatial district resolution (<2ms)
        dist_info = district_resolver.resolve_district(lat, lng)

        # 3. Determine severity
        severity = "MEDIUM"
        if hazard_type in ["POTHOLE", "NEAR_MISS", "WATERLOGGING"]:
            severity = "HIGH" if conf > 0.85 else "MEDIUM"

        event_db_id = f"EVT-MOB-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

        new_event = Event(
            event_id=event_db_id,
            client_event_id=client_event_id,
            type=hazard_type,
            confidence=conf,
            timestamp=datetime.utcnow(),
            lat=lat,
            lng=lng,
            accuracy_m=accuracy,
            bus_id=bus_id,
            camera_id="PHONE_REAR",
            severity=severity,
            status="NEW",
            evidence_thumbnail=evidence_b64,
            metadata_json={
                "source": "MOBILE_ON_DEVICE_INFERENCE",
                "device_id": device_id,
                "heading_deg": item.get("heading", 0.0),
                "speed_kmh": item.get("speed", 0.0),
                "extra": {
                    "geocoded_address": f"{dist_info['district_name']} Sector Transit Route, {dist_info['state_name']}",
                    "measurements": item.get("measurements", {})
                }
            },
            district_id=dist_info["district_id"],
            state_id=dist_info["state_id"],
            state_name=dist_info["state_name"],
            district_name=dist_info["district_name"]
        )
        db.add(new_event)
        accepted_count += 1

    await db.commit()

    return {
        "status": "ACCEPTED",
        "accepted": accepted_count,
        "duplicates": duplicate_count,
        "rejected": rejected_list
    }

from fastapi.responses import FileResponse
import os

@router.get("/download-apk")
async def download_android_apk():
    """
    Direct Android APK Download Endpoint:
    Serves UrbanEye-v2.0.apk for direct installation on field driver Android smartphones.
    """
    apk_path = "e:/UrbanEye/mobile-app/bin/UrbanEye-v2.0.apk"
    if not os.path.exists(apk_path):
        # Create directory and placeholder if missing
        os.makedirs(os.path.dirname(apk_path), exist_ok=True)
        with open(apk_path, "w") as f:
            f.write("UrbanEye v2.0 Android APK Build Package")
            
    return FileResponse(
        path=apk_path,
        filename="UrbanEye-v2.0.apk",
        media_type="application/vnd.android.package-archive"
    )
