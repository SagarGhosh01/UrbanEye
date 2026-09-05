from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PairingRequestResponse(BaseModel):
    pin: str
    device_session_id: str
    expires_at: datetime


class PairingConfirmRequest(BaseModel):
    pin: str
    bus_label: str


class PairingStatusResponse(BaseModel):
    status: str
    session_id: Optional[str] = None
    district_id: Optional[str] = None
    bus_label: Optional[str] = None


class PairingSessionResponse(BaseModel):
    session_id: str
    device_session_id: str
    pin: str
    district_id: Optional[str] = None
    state_id: Optional[str] = None
    bus_label: Optional[str] = None
    status: str
    created_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True
