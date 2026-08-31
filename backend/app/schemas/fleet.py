from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class BusTelemetry(BaseModel):
    bus_id: str
    registration_no: Optional[str] = None
    route_name: str
    status: str
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    speed_kmh: float = 0.0
    heading_deg: float = 0.0
    last_seen: datetime

    class Config:
        from_attributes = True

class EdgeDeviceTelemetry(BaseModel):
    device_id: str
    bus_id: str
    model_family: str
    firmware_version: str
    model_version: str
    status: str  # ONLINE, BUFFERING_OFFLINE, DEGRADED, OFFLINE
    cpu_usage_pct: float
    gpu_usage_pct: float
    temperature_c: float
    storage_free_gb: float
    buffered_events_count: int
    last_heartbeat: datetime

    class Config:
        from_attributes = True

class VehicleSnapshotCreate(BaseModel):
    bus_id: str
    timestamp: datetime = datetime.utcnow()
    lat: Optional[float] = None
    lng: Optional[float] = None
    cars: int = 0
    motorcycles: int = 0
    buses: int = 0
    trucks: int = 0
    auto_rickshaws: int = 0
    pedestrians: int = 0
    total_vehicles: int = 0
    density_level: str = "LOW"
