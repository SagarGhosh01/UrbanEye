import secrets
import logging
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from ..db.models import PairingSession, Bus
import uuid

logger = logging.getLogger("UrbanEye.Pairing")
PIN_TTL_MINUTES = 10
MAX_CONFIRM_ATTEMPTS = 5


def generate_pin() -> str:
    return f"{secrets.randbelow(900000) + 100000}"


async def create_pairing_request(db: AsyncSession) -> PairingSession:
    pin = generate_pin()
    device_session_id = str(uuid.uuid4())
    session = PairingSession(
        session_id=str(uuid.uuid4()),
        pin=pin,
        device_session_id=device_session_id,
        status="PENDING",
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(minutes=PIN_TTL_MINUTES),
        attempts=0,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def confirm_pairing(pin: str, bus_label: str, user_id: str, district_id: str, state_id: str, db: AsyncSession) -> PairingSession:
    result = await db.execute(
        select(PairingSession).where(and_(PairingSession.pin == pin, PairingSession.status == "PENDING"))
    )
    session = result.scalars().first()
    if not session:
        raise ValueError("Invalid or already used PIN")

    session.attempts += 1
    if session.attempts > MAX_CONFIRM_ATTEMPTS:
        session.status = "EXPIRED"
        await db.commit()
        raise ValueError("Too many attempts. PIN invalidated.")

    if datetime.utcnow() > session.expires_at:
        session.status = "EXPIRED"
        await db.commit()
        raise ValueError("PIN has expired")

    session.district_id = district_id
    session.state_id = state_id
    session.bus_label = bus_label
    session.paired_by_user_id = user_id
    session.status = "PAIRED"

    bus_id = f"BUS-{bus_label.replace(' ', '-').upper()[:20]}"
    existing_bus = await db.get(Bus, bus_id)
    if not existing_bus:
        db.add(Bus(bus_id=bus_id, registration_no=bus_label, route_name=f"Paired: {bus_label}", status="ACTIVE", district_id=district_id, state_id=state_id))
    else:
        existing_bus.district_id = district_id
        existing_bus.state_id = state_id
        existing_bus.status = "ACTIVE"

    await db.commit()
    await db.refresh(session)
    return session


async def get_pairing_status(device_session_id: str, db: AsyncSession):
    result = await db.execute(select(PairingSession).where(PairingSession.device_session_id == device_session_id))
    session = result.scalars().first()
    if session and session.status == "PENDING" and datetime.utcnow() > session.expires_at:
        session.status = "EXPIRED"
        await db.commit()
        await db.refresh(session)
    return session


async def get_active_pairings(district_id: str, db: AsyncSession):
    result = await db.execute(
        select(PairingSession).where(and_(PairingSession.district_id == district_id, PairingSession.status == "PAIRED"))
    )
    return result.scalars().all()


async def revoke_pairing(session_id: str, user_district_id: str, user_role: str, db: AsyncSession):
    session = await db.get(PairingSession, session_id)
    if not session:
        raise ValueError("Session not found")
    if user_role == "district_head" and session.district_id != user_district_id:
        raise PermissionError("Cannot revoke another district's pairing")
    session.status = "REVOKED"
    await db.commit()
    await db.refresh(session)
    return session
