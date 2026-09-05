from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import uuid
from .database import Base


class State(Base):
    __tablename__ = "states"

    state_id = Column(String(10), primary_key=True)
    state_code = Column(String(5), unique=True, nullable=False, index=True)
    state_name = Column(String(100), nullable=False)
    bounds_north = Column(Float, nullable=True)
    bounds_south = Column(Float, nullable=True)
    bounds_east = Column(Float, nullable=True)
    bounds_west = Column(Float, nullable=True)

    districts = relationship("District", back_populates="state")
    users = relationship("User", back_populates="state")


class District(Base):
    __tablename__ = "districts"

    district_id = Column(String(20), primary_key=True)
    state_id = Column(String(10), ForeignKey("states.state_id"), nullable=False, index=True)
    district_name = Column(String(100), nullable=False)
    district_code = Column(String(10), nullable=True)
    center_lat = Column(Float, nullable=True)
    center_lng = Column(Float, nullable=True)
    bounds_north = Column(Float, nullable=True)
    bounds_south = Column(Float, nullable=True)
    bounds_east = Column(Float, nullable=True)
    bounds_west = Column(Float, nullable=True)

    state = relationship("State", back_populates="districts")
    users = relationship("User", back_populates="district")
    buses = relationship("Bus", back_populates="district")
    events = relationship("Event", back_populates="district")
    pairing_sessions = relationship("PairingSession", back_populates="district")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(100))
    role = Column(String(30), default="district_head", nullable=False)
    state_id = Column(String(10), ForeignKey("states.state_id"), nullable=True)
    district_id = Column(String(20), ForeignKey("districts.district_id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    state = relationship("State", back_populates="users")
    district = relationship("District", back_populates="users")


class PairingSession(Base):
    __tablename__ = "pairing_sessions"

    session_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pin = Column(String(6), nullable=False, index=True)
    device_session_id = Column(String, unique=True, nullable=False, index=True)
    district_id = Column(String(20), ForeignKey("districts.district_id"), nullable=True)
    state_id = Column(String(10), ForeignKey("states.state_id"), nullable=True)
    bus_label = Column(String(100), nullable=True)
    status = Column(String(20), default="PENDING", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    paired_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    attempts = Column(Integer, default=0)

    district = relationship("District", back_populates="pairing_sessions")


class Bus(Base):
    __tablename__ = "buses"

    bus_id = Column(String(50), primary_key=True, index=True)
    registration_no = Column(String(30), nullable=True)
    route_name = Column(String(100), nullable=False)
    status = Column(String(20), default="ACTIVE")
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    speed_kmh = Column(Float, default=0.0)
    heading_deg = Column(Float, default=0.0)
    last_seen = Column(DateTime, default=datetime.utcnow)
    district_id = Column(String(20), ForeignKey("districts.district_id"), nullable=True)
    state_id = Column(String(10), ForeignKey("states.state_id"), nullable=True)

    district = relationship("District", back_populates="buses")
    edge_device = relationship("EdgeDevice", back_populates="bus", uselist=False)
    events = relationship("Event", back_populates="bus")


class Camera(Base):
    __tablename__ = "cameras"

    camera_id = Column(String(50), primary_key=True)
    bus_id = Column(String(50), ForeignKey("buses.bus_id"), nullable=False)
    position = Column(String(30), default="FRONT")
    fov_deg = Column(Float, default=120.0)
    resolution = Column(String(20), default="1920x1080")
    fps = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)


class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String(60), unique=True, nullable=False, index=True)
    bus_id = Column(String(50), ForeignKey("buses.bus_id"), nullable=True, index=True)
    bus_reg_no = Column(String(30), nullable=True)
    status = Column(String(20), default="pending", index=True)  # pending, approved, revoked
    api_token_hash = Column(String(128), nullable=True)
    app_version = Column(String(30), default="1.0.0")
    os_version = Column(String(30), default="Android 14")
    registered_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow, nullable=True)

    bus = relationship("Bus")
    assignment_history = relationship("DeviceBusAssignmentHistory", back_populates="device")


class DeviceBusAssignmentHistory(Base):
    __tablename__ = "device_bus_assignment_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String, ForeignKey("devices.id"), nullable=False, index=True)
    bus_id = Column(String(50), ForeignKey("buses.bus_id"), nullable=False, index=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    unassigned_at = Column(DateTime, nullable=True)

    device = relationship("Device", back_populates="assignment_history")
    bus = relationship("Bus")


class EdgeDevice(Base):
    __tablename__ = "edge_devices"

    device_id = Column(String(50), primary_key=True)
    bus_id = Column(String(50), ForeignKey("buses.bus_id"), unique=True, nullable=False)
    model_family = Column(String(50), default="NVIDIA Jetson Orin Nano 8GB")
    firmware_version = Column(String(30), default="v2.4.1")
    model_version = Column(String(50), default="yolov8n-urbaneye-v3.2")
    status = Column(String(20), default="ONLINE")
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
    client_event_id = Column(String(60), unique=True, nullable=True, index=True)
    type = Column(String(40), index=True, nullable=False)
    confidence = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    accuracy_m = Column(Float, default=5.0)
    bus_id = Column(String(50), ForeignKey("buses.bus_id"), nullable=False, index=True)
    camera_id = Column(String(50), default="FRONT")
    severity = Column(String(20), default="MEDIUM", index=True)
    status = Column(String(30), default="NEW")
    evidence_thumbnail = Column(Text, nullable=True)
    evidence_clip_url = Column(String(255), nullable=True)
    metadata_json = Column(JSON, default=dict)
    district_id = Column(String(20), ForeignKey("districts.district_id"), nullable=True, index=True)
    state_id = Column(String(10), ForeignKey("states.state_id"), nullable=True, index=True)
    state_name = Column(String(100), nullable=True, index=True)
    district_name = Column(String(100), nullable=True, index=True)
    source_device_id = Column(String, ForeignKey("devices.id"), nullable=True)
    device_session_id = Column(String, nullable=True)

    bus = relationship("Bus", back_populates="events")
    district = relationship("District", back_populates="events")
    source_device = relationship("Device")
    anpr_record = relationship("ANPRRecord", back_populates="event", uselist=False)


class ANPRRecord(Base):
    __tablename__ = "anpr_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(60), ForeignKey("events.event_id"), unique=True, nullable=False)
    registration_no = Column(String(30), nullable=True)
    ocr_confidence = Column(Float, default=0.0)
    vehicle_type = Column(String(30), default="CAR")
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
    density_level = Column(String(20), default="LOW")


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
    condition_score = Column(Float, default=92.0)
    maintenance_priority = Column(String(20), default="NORMAL")
    last_inspected = Column(DateTime, default=datetime.utcnow)
    district_id = Column(String(20), ForeignKey("districts.district_id"), nullable=True)


class BandwidthMetric(Base):
    __tablename__ = "bandwidth_metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow)
    raw_video_bytes = Column(Float, default=0.0)
    actual_edge_bytes = Column(Float, default=0.0)
    savings_percentage = Column(Float, default=0.0)
    events_transmitted = Column(Integer, default=0)
