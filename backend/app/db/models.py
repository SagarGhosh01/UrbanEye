from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(100))
    role = Column(String(30), default="viewer", nullable=False)  # viewer, analyst, admin, law_enforcement_liaison
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Bus(Base):
    __tablename__ = "buses"
    
    bus_id = Column(String(50), primary_key=True, index=True)
    registration_no = Column(String(30), nullable=True)
    route_name = Column(String(100), nullable=False)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, IDLE, OFFLINE, MAINTENANCE
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    speed_kmh = Column(Float, default=0.0)
    heading_deg = Column(Float, default=0.0)
    last_seen = Column(DateTime, default=datetime.utcnow)
    
    edge_device = relationship("EdgeDevice", back_populates="bus", uselist=False)
    events = relationship("Event", back_populates="bus")

class Camera(Base):
    __tablename__ = "cameras"
    
    camera_id = Column(String(50), primary_key=True)
    bus_id = Column(String(50), ForeignKey("buses.bus_id"), nullable=False)
    position = Column(String(30), default="FRONT")  # FRONT, REAR, LEFT, RIGHT, CABIN
    fov_deg = Column(Float, default=120.0)
    resolution = Column(String(20), default="1980x1080")
    fps = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)

class EdgeDevice(Base):
    __tablename__ = "edge_devices"
    
    device_id = Column(String(50), primary_key=True)
    bus_id = Column(String(50), ForeignKey("buses.bus_id"), unique=True, nullable=False)
    model_family = Column(String(50), default="NVIDIA Jetson Orin Nano 8GB")
    firmware_version = Column(String(30), default="v2.4.1")
    model_version = Column(String(50), default="yolov8n-urbaneye-v3.2")
    status = Column(String(20), default="ONLINE")  # ONLINE, BUFFERING_OFFLINE, DEGRADED, OFFLINE
    cpu_usage_pct = Column(Float, default=24.5)
    gpu_usage_pct = Column(Float, default=62.0)
    temperature_c = Column(Float, default=52.4)
    storage_free_gb = Column(Float, default=45.8)
    buffered_events_count = Column(Integer, default=0)
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    
    bus = relationship("Bus", back_populates="edge_device")

class Event(Base):
    __tablename__ = "events"
    
    event_id = Column(String(60), primary_key=True, index=True)
    type = Column(String(40), index=True, nullable=False)  # POTHOLE, WATERLOGGING, DAMAGED_SIGN, NEAR_MISS, ILLEGAL_PARKING, CONGESTION, ANPR_ALERT
    confidence = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    accuracy_m = Column(Float, default=5.0)
    bus_id = Column(String(50), ForeignKey("buses.bus_id"), nullable=False, index=True)
    camera_id = Column(String(50), default="FRONT")
    severity = Column(String(20), default="MEDIUM", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="NEW")  # NEW, REVIEWED, DISPATCHED, RESOLVED, DISMISSED
    evidence_thumbnail = Column(Text, nullable=True)  # base64 or URL
    evidence_clip_url = Column(String(255), nullable=True)
    metadata_json = Column(JSON, default=dict)
    
    bus = relationship("Bus", back_populates="events")
    anpr_record = relationship("ANPRRecord", back_populates="event", uselist=False)

class ANPRRecord(Base):
    __tablename__ = "anpr_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(60), ForeignKey("events.event_id"), unique=True, nullable=False)
    registration_no = Column(String(30), nullable=True)  # Null or "Not readable" if confidence below threshold
    ocr_confidence = Column(Float, default=0.0)
    vehicle_type = Column(String(30), default="CAR")  # CAR, BUS, TRUCK, MOTORCYCLE, AUTO_RICKSHAW
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    event = relationship("Event", back_populates="anpr_record")

class VehicleCountSnapshot(Base):
    __tablename__ = "vehicle_count_snapshots"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    bus_id = Column(String(50), ForeignKey("buses.bus_id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    cars = Column(Integer, default=0)
    motorcycles = Column(Integer, default=0)
    buses = Column(Integer, default=0)
    trucks = Column(Integer, default=0)
    auto_rickshaws = Column(Integer, default=0)
    pedestrians = Column(Integer, default=0)
    total_vehicles = Column(Integer, default=0)
    density_level = Column(String(20), default="LOW")  # LOW, MODERATE, HIGH, SEVERE

class RoadSegment(Base):
    __tablename__ = "road_segments"
    
    segment_id = Column(String(60), primary_key=True)
    road_name = Column(String(100), nullable=False)
    start_lat = Column(Float, nullable=False)
    start_lng = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lng = Column(Float, nullable=False)
    pothole_count = Column(Integer, default=0)
    waterlogging_count = Column(Integer, default=0)
    condition_score = Column(Float, default=92.0)  # 0 to 100 (100 is pristine)
    maintenance_priority = Column(String(20), default="NORMAL")  # NORMAL, WATCHLIST, URGENT
    last_inspected = Column(DateTime, default=datetime.utcnow)

class BandwidthMetric(Base):
    __tablename__ = "bandwidth_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow)
    raw_video_bytes = Column(Float, default=0.0)
    actual_edge_bytes = Column(Float, default=0.0)
    savings_percentage = Column(Float, default=0.0)
    events_transmitted = Column(Integer, default=0)
