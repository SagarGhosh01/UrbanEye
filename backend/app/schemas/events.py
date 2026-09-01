from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    POTHOLE = "POTHOLE"
    WATERLOGGING = "WATERLOGGING"
    DAMAGED_SIGN = "DAMAGED_SIGN"
    NEAR_MISS = "NEAR_MISS"
    ILLEGAL_PARKING = "ILLEGAL_PARKING"
    CONGESTION = "CONGESTION"
    ANPR_ALERT = "ANPR_ALERT"
    ROAD_SURFACE_EROSION = "ROAD_SURFACE_EROSION"
    MISSING_ROAD_DIVIDER = "MISSING_ROAD_DIVIDER"
    MISSING_ZEBRA_CROSSING = "MISSING_ZEBRA_CROSSING"
    MISSING_SIGNBOARD = "MISSING_SIGNBOARD"

class EventSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class EventStatus(str, Enum):
    NEW = "NEW"
    REVIEWED = "REVIEWED"
    DISPATCHED = "DISPATCHED"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"

class LocationSchema(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    raw_lat: Optional[float] = None
    raw_lng: Optional[float] = None
    raw_accuracy_m: Optional[float] = 8.0
    snapped_lat: Optional[float] = None
    snapped_lng: Optional[float] = None
    accuracy_m: Optional[float] = 5.0
    status: Optional[str] = "LOCKED"  # LOCKED, DEGRADED, UNAVAILABLE
    method: Optional[str] = "gps+road_snap+heading_offset"
    offset_applied_m: Optional[float] = 4.5
    confirmed_passes: Optional[int] = 1
    verification_status: Optional[str] = "REPORTED"  # REPORTED vs CONFIRMED
    resolved_address: Optional[str] = None
    road_name: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = "New Delhi"
    postal_code: Optional[str] = None
    maps_url: Optional[str] = None

class EvidenceSchema(BaseModel):
    thumbnail_url: Optional[str] = None
    clip_url: Optional[str] = None
    thumbnail_base64: Optional[str] = None

class EventMetadataSchema(BaseModel):
    model_version: str = "yolov8n-urbaneye-v3.2"
    edge_device_id: str = "EDGE-0101"
    bounding_boxes: Optional[List[Dict[str, Any]]] = None
    extra: Optional[Dict[str, Any]] = None

class EventCreate(BaseModel):
    event_id: str
    type: EventType
    confidence: float = Field(..., ge=0.0, le=1.0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    location: LocationSchema
    bus_id: str
    camera_id: str = "FRONT"
    severity: EventSeverity = EventSeverity.MEDIUM
    status: EventStatus = EventStatus.NEW
    evidence: Optional[EvidenceSchema] = None
    metadata: Optional[EventMetadataSchema] = None
    anpr_plate: Optional[str] = None
    anpr_confidence: Optional[float] = None

class EventResponse(BaseModel):
    event_id: str
    type: str
    confidence: float
    timestamp: datetime
    location: LocationSchema
    bus_id: str
    camera_id: str
    severity: str
    status: str
    evidence: EvidenceSchema
    metadata: EventMetadataSchema
    anpr_record: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class EventStatusUpdate(BaseModel):
    status: EventStatus
    action_note: Optional[str] = None
