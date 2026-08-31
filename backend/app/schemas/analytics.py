from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    weight: float
    type: str  # CONGESTION, POTHOLE, WATERLOGGING, INCIDENT

class RoadSegmentResponse(BaseModel):
    segment_id: str
    road_name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    pothole_count: int
    waterlogging_count: int
    condition_score: float
    maintenance_priority: str
    last_inspected: datetime

    class Config:
        from_attributes = True

class BandwidthReport(BaseModel):
    raw_video_mb_est: float
    actual_edge_mb: float
    savings_percentage: float
    events_transmitted: int
    network_cost_saved_usd_est: float

class FleetKPISummary(BaseModel):
    active_buses_count: int
    total_events_today: int
    potholes_detected: int
    waterlogging_detected: int
    near_miss_incidents: int
    total_vehicles_tracked: int
    avg_traffic_density_index: float
    bandwidth_savings_pct: float
    system_health_status: str
