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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["law_enforcement_liaison", "admin"]))
):
    """
    Restricted endpoint: accessible ONLY by law_enforcement_liaison or admin.
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
            "evidence_thumbnail": ev.evidence_thumbnail,
            "evidence_clip_url": ev.evidence_clip_url
        })
    return results

@router.post("/flag/{anpr_id}")
async def flag_vehicle_plate(
    anpr_id: str,
    reason: str = "Suspected traffic violation / Alert",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["law_enforcement_liaison", "admin"]))
):
    anpr = await db.get(ANPRRecord, anpr_id)
    if not anpr:
        raise HTTPException(status_code=404, detail="ANPR Record not found")
        
    anpr.is_flagged = True
    anpr.flag_reason = reason
    await db.commit()
    return {"status": "SUCCESS", "anpr_id": anpr_id, "is_flagged": True}
