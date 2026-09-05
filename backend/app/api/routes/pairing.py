from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.database import get_db
from ...db.models import User
from ...services.pairing import create_pairing_request, confirm_pairing, get_pairing_status, get_active_pairings, revoke_pairing
from ...schemas.pairing import PairingRequestResponse, PairingConfirmRequest, PairingStatusResponse, PairingSessionResponse
from ..deps import get_current_user

router = APIRouter()


@router.post("/request", response_model=PairingRequestResponse)
async def request_pairing(db: AsyncSession = Depends(get_db)):
    """Called by mobile app. Generates a 6-digit PIN with 10-min TTL."""
    session = await create_pairing_request(db)
    return PairingRequestResponse(pin=session.pin, device_session_id=session.device_session_id, expires_at=session.expires_at)


@router.post("/confirm")
async def confirm_pairing_endpoint(
    req: PairingConfirmRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Called by portal District Head. Validates PIN and binds device to district."""
    if not current_user.district_id:
        raise HTTPException(status_code=400, detail="User must be assigned to a district to pair buses")
    try:
        session = await confirm_pairing(
            pin=req.pin, bus_label=req.bus_label, user_id=current_user.id,
            district_id=current_user.district_id, state_id=current_user.state_id, db=db,
        )
        return {"status": "PAIRED", "session_id": session.session_id, "bus_label": session.bus_label, "district_id": session.district_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status/{device_session_id}", response_model=PairingStatusResponse)
async def check_pairing_status(device_session_id: str, db: AsyncSession = Depends(get_db)):
    """Polled by mobile app to check if pairing was confirmed."""
    session = await get_pairing_status(device_session_id, db)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return PairingStatusResponse(
        status=session.status, session_id=session.session_id if session.status == "PAIRED" else None,
        district_id=session.district_id, bus_label=session.bus_label,
    )


@router.get("/active", response_model=list[PairingSessionResponse])
async def list_active_pairings(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lists active pairings for the current user's district."""
    district_id = current_user.district_id
    if current_user.role == "national_admin":
        from sqlalchemy.future import select
        from ...db.models import PairingSession
        result = await db.execute(select(PairingSession).where(PairingSession.status == "PAIRED"))
        sessions = result.scalars().all()
    elif district_id:
        sessions = await get_active_pairings(district_id, db)
    else:
        sessions = []
    return sessions


@router.delete("/{session_id}")
async def revoke_pairing_endpoint(session_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Revoke a pairing session."""
    try:
        session = await revoke_pairing(session_id, current_user.district_id, current_user.role, db)
        return {"status": "REVOKED", "session_id": session.session_id}
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=400, detail=str(e))
