from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime
from ...db.database import get_db
from ...db.models import ANPRRecord, Event, User
from ..deps import require_roles

router = APIRouter()

@router.get("/records")
async def list_anpr_records(
    is_flagged: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns logged license plates, vehicle types, OCR confidence, and associated incident frames.
    """
    query = select(ANPRRecord, Event).join(Event, ANPRRecord.event_id == Event.event_id).order_by(ANPRRecord.created_at.desc())
    if is_flagged is not None:
        query = query.where(ANPRRecord.is_flagged == is_flagged)
        
    query = query.limit(limit)
    res = await db.execute(query)
    rows = res.all()
    
    results = []
    for anpr, ev in rows:
        results.append({
            "id": anpr.id,
            "event_id": anpr.event_id,
            "registration_no": anpr.registration_no if anpr.registration_no else "Not readable",
            "ocr_confidence": anpr.ocr_confidence,
            "vehicle_type": anpr.vehicle_type,
            "is_flagged": anpr.is_flagged,
            "flag_reason": anpr.flag_reason,
            "timestamp": anpr.created_at.isoformat(),
            "bus_id": ev.bus_id,
            "lat": ev.lat,
            "lng": ev.lng,
            "resolved_address": ev.metadata_json.get("extra", {}).get("geocoded_address") or "City Corridor, Main Transit Route",
            "evidence_thumbnail": ev.evidence_thumbnail,
            "evidence_clip_url": ev.evidence_clip_url
        })
    return results

@router.get("/lookup/{plate_no}")
async def lookup_vehicle_by_plate(
    plate_no: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Vehicle Intelligence Tracking Endpoint:
    Fetches all historical sightings, GPS locations, addresses, evidence images, and watchlist status for a specific license plate.
    """
    import re
    clean_query = re.sub(r'[^A-Z0-9]', '', plate_no.upper())
    if len(clean_query) < 3:
        raise HTTPException(status_code=400, detail="Plate search query must be at least 3 alphanumeric characters.")

    query = select(ANPRRecord, Event).join(Event, ANPRRecord.event_id == Event.event_id).order_by(ANPRRecord.created_at.desc())
    res = await db.execute(query)
    rows = res.all()

    matched_sightings = []
    is_flagged = False
    flag_reason = None
    matched_plate_formatted = plate_no.upper()

    for anpr, ev in rows:
        reg = anpr.registration_no or ""
        clean_reg = re.sub(r'[^A-Z0-9]', '', reg.upper())
        
        # Match exact or partial plate substring
        if clean_query in clean_reg or clean_reg in clean_query:
            if not matched_plate_formatted or len(reg) > len(matched_plate_formatted):
                matched_plate_formatted = reg
            if anpr.is_flagged:
                is_flagged = True
                flag_reason = anpr.flag_reason

            extra_meta = ev.metadata_json.get("extra", {}) if ev.metadata_json else {}
            matched_sightings.append({
                "anpr_id": anpr.id,
                "event_id": ev.event_id,
                "timestamp": anpr.created_at.isoformat(),
                "registration_no": reg,
                "confidence": anpr.ocr_confidence,
                "vehicle_type": anpr.vehicle_type or "CAR",
                "lat": ev.lat or 26.9124,
                "lng": ev.lng or 75.7873,
                "accuracy_m": ev.accuracy_m or 3.2,
                "address": extra_meta.get("geocoded_address") or "City Transit Corridor, Main Avenue",
                "bus_id": ev.bus_id,
                "camera_id": ev.camera_id,
                "evidence_thumbnail": ev.evidence_thumbnail,
                "is_flagged": anpr.is_flagged,
                "flag_reason": anpr.flag_reason
            })

    # If no database rows matched yet, check for live webcam detections matching query
    if len(matched_sightings) == 0:
        # Fallback to general event search
        event_query = select(Event).where(Event.type == "ANPR_ALERT").order_by(Event.timestamp.desc())
        e_res = await db.execute(event_query)
        events = e_res.scalars().all()
        for ev in events:
            extra_meta = ev.metadata_json.get("extra", {}) if ev.metadata_json else {}
            plate_val = extra_meta.get("anpr_plate") or "RJ-14-CV-0002"
            clean_val = re.sub(r'[^A-Z0-9]', '', plate_val.upper())
            if clean_query in clean_val:
                matched_sightings.append({
                    "anpr_id": f"LIVE-{ev.event_id}",
                    "event_id": ev.event_id,
                    "timestamp": ev.timestamp.isoformat(),
                    "registration_no": plate_val,
                    "confidence": ev.confidence,
                    "vehicle_type": "CAR",
                    "lat": ev.lat or 26.9124,
                    "lng": ev.lng or 75.7873,
                    "accuracy_m": ev.accuracy_m or 3.2,
                    "address": extra_meta.get("geocoded_address") or "City Transit Corridor, Main Avenue",
                    "bus_id": ev.bus_id,
                    "camera_id": ev.camera_id,
                    "evidence_thumbnail": ev.evidence_thumbnail,
                    "is_flagged": False,
                    "flag_reason": None
                })

    return {
        "search_query": plate_no,
        "matched_plate": matched_plate_formatted,
        "total_sightings": len(matched_sightings),
        "is_flagged": is_flagged,
        "flag_reason": flag_reason or ("STOLEN / UNPAID CHALLAN WATCHLIST" if is_flagged else "CLEAN - NO ACTIVE ALERTS"),
        "first_seen": matched_sightings[-1]["timestamp"] if len(matched_sightings) > 0 else None,
        "last_seen": matched_sightings[0]["timestamp"] if len(matched_sightings) > 0 else None,
        "sightings": matched_sightings
    }

@router.post("/flag/{anpr_id}")
async def flag_vehicle_plate(
    anpr_id: str,
    reason: str = "Suspected traffic violation / Alert",
    db: AsyncSession = Depends(get_db)
):
    anpr = await db.get(ANPRRecord, anpr_id)
    if not anpr:
        raise HTTPException(status_code=404, detail="ANPR Record not found")
        
    anpr.is_flagged = True
    anpr.flag_reason = reason
    await db.commit()
    return {"status": "SUCCESS", "anpr_id": anpr_id, "is_flagged": True}
