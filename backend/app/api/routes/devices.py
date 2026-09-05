from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime
import uuid
import hashlib

from ...db.database import get_db
from ...db.models import Device, DeviceBusAssignmentHistory, Bus
from ...schemas.events import LocationSchema

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_device(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Mobile Device Self-Registration Endpoint:
    Mobile app calls this on first run with device_id, bus_reg_no, app_version, and os_version.
    Returns status: 'pending' or 'approved', plus device bearer API token.
    """
    device_id = payload.get("device_id") or str(uuid.uuid4())
    bus_reg_no = payload.get("bus_reg_no")
    app_version = payload.get("app_version", "1.0.0")
    os_version = payload.get("os_version", "Android 14")

    # Generate persistent device API token
    raw_token = f"urbaneye_dev_{uuid.uuid4().hex}"
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

    # Find matching bus by registration number if present
    bus_id = None
    if bus_reg_no:
        bus_q = select(Bus).where(Bus.registration_no == bus_reg_no)
        bus_res = await db.execute(bus_q)
        matched_bus = bus_res.scalars().first()
        if matched_bus:
            bus_id = matched_bus.bus_id

    # Check if device already exists
    dev_q = select(Device).where(Device.device_id == device_id)
    dev_res = await db.execute(dev_q)
    existing_dev = dev_res.scalars().first()

    if existing_dev:
        existing_dev.bus_reg_no = bus_reg_no or existing_dev.bus_reg_no
        if bus_id:
            existing_dev.bus_id = bus_id
        existing_dev.app_version = app_version
        existing_dev.os_version = os_version
        existing_dev.last_seen_at = datetime.utcnow()
        existing_dev.api_token_hash = token_hash
        await db.commit()
        return {
            "status": existing_dev.status,
            "device_id": existing_dev.device_id,
            "bus_id": existing_dev.bus_id,
            "bus_reg_no": existing_dev.bus_reg_no,
            "api_token": raw_token
        }

    # Default status: approved for auto-onboarding or pending
    auto_approve = True  # Default auto-approve for seamless onboarding
    dev_status = "approved" if auto_approve else "pending"

    new_dev = Device(
        id=str(uuid.uuid4()),
        device_id=device_id,
        bus_id=bus_id or "BUS-101",
        bus_reg_no=bus_reg_no or "RJ-14-PA-1001",
        status=dev_status,
        api_token_hash=token_hash,
        app_version=app_version,
        os_version=os_version,
        registered_at=datetime.utcnow(),
        last_seen_at=datetime.utcnow()
    )
    db.add(new_dev)

    if bus_id:
        history = DeviceBusAssignmentHistory(
            id=str(uuid.uuid4()),
            device_id=new_dev.id,
            bus_id=bus_id,
            assigned_at=datetime.utcnow()
        )
        db.add(history)

    await db.commit()

    return {
        "status": dev_status,
        "device_id": device_id,
        "bus_id": new_dev.bus_id,
        "bus_reg_no": new_dev.bus_reg_no,
        "api_token": raw_token
    }

@router.get("")
async def list_devices(
    status: Optional[str] = Query(None, description="Filter by device status (pending, approved, revoked)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fleet Admin Device Registry Endpoint:
    Lists all mobile devices, bus bindings, app versions, heartbeat timestamps, and statuses.
    """
    query = select(Device).order_by(Device.last_seen_at.desc())
    if status:
        query = query.where(Device.status == status)

    res = await db.execute(query)
    devices = res.scalars().all()

    results = []
    for d in devices:
        results.append({
            "id": d.id,
            "device_id": d.device_id,
            "bus_id": d.bus_id,
            "bus_reg_no": d.bus_reg_no,
            "status": d.status,
            "app_version": d.app_version,
            "os_version": d.os_version,
            "registered_at": d.registered_at.isoformat() if d.registered_at else None,
            "last_seen_at": d.last_seen_at.isoformat() if d.last_seen_at else None
        })
    return results

@router.patch("/{device_id}/approve")
async def approve_device(
    device_id: str,
    db: AsyncSession = Depends(get_db)
):
    query = select(Device).where(Device.device_id == device_id)
    res = await db.execute(query)
    dev = res.scalars().first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")

    dev.status = "approved"
    dev.last_seen_at = datetime.utcnow()
    await db.commit()
    return {"status": "SUCCESS", "device_id": device_id, "new_status": "approved"}

@router.patch("/{device_id}/revoke")
async def revoke_device(
    device_id: str,
    db: AsyncSession = Depends(get_db)
):
    query = select(Device).where(Device.device_id == device_id)
    res = await db.execute(query)
    dev = res.scalars().first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")

    dev.status = "revoked"
    await db.commit()
    return {"status": "SUCCESS", "device_id": device_id, "new_status": "revoked"}

@router.patch("/{device_id}/reassign")
async def reassign_device_bus(
    device_id: str,
    new_bus_id: str = Query(...),
    new_bus_reg_no: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Device).where(Device.device_id == device_id)
    res = await db.execute(query)
    dev = res.scalars().first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")

    # Close old assignment history
    hist_q = select(DeviceBusAssignmentHistory).where(
        DeviceBusAssignmentHistory.device_id == dev.id,
        DeviceBusAssignmentHistory.unassigned_at == None
    )
    hist_res = await db.execute(hist_q)
    active_hist = hist_res.scalars().first()
    if active_hist:
        active_hist.unassigned_at = datetime.utcnow()

    # Create new assignment history
    dev.bus_id = new_bus_id
    if new_bus_reg_no:
        dev.bus_reg_no = new_bus_reg_no

    new_hist = DeviceBusAssignmentHistory(
        id=str(uuid.uuid4()),
        device_id=dev.id,
        bus_id=new_bus_id,
        assigned_at=datetime.utcnow()
    )
    db.add(new_hist)
    await db.commit()

    return {
        "status": "SUCCESS",
        "device_id": device_id,
        "new_bus_id": new_bus_id,
        "new_bus_reg_no": dev.bus_reg_no
    }
