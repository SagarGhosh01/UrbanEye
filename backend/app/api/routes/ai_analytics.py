from fastapi import APIRouter, Depends, Query, Body
from typing import Dict, Any, List
from ...services.traffic_ai import traffic_optimizer
from ...services.road_ai import road_health_predictor
from ...services.ai_assistant import ai_assistant

router = APIRouter()

@router.post("/traffic/predict-flow")
async def predict_traffic_flow(
    vehicle_counts: Dict[str, int] = Body(..., example={"car": 12, "bus": 3, "truck": 1, "motorcycle": 8, "auto_rickshaw": 4, "pedestrian": 2}),
    current_speed_kmh: float = Query(28.5, ge=0.0, le=140.0)
):
    """
    AI Traffic Congestion & Signal Control Recommendation API:
    Calculates Passenger Car Units (PCU), Level of Service (LOS), 15m forecast, and adaptive signal timing.
    """
    return traffic_optimizer.analyze_traffic_flow(vehicle_counts, current_speed_kmh)

@router.post("/road/predict-health")
async def predict_road_health(
    potholes: List[Dict[str, Any]] = Body(..., example=[{"dimensions": {"width_cm": 35.0, "length_cm": 42.0, "depth_cm": 8.5, "volume_litres": 9.8}}]),
    waterlogging_present: bool = Query(False),
    daily_traffic_pcu: float = Query(1450.0)
):
    """
    AI Predictive Road Health Index (RHI) & Pavement Degradation Forecasting API.
    """
    return road_health_predictor.calculate_road_health_index(potholes, waterlogging_present, daily_traffic_pcu)

@router.post("/assistant/generate-digest")
async def generate_ai_digest(
    event_type: str = Query("POTHOLE"),
    severity: str = Query("HIGH"),
    resolved_address: str = Query("Sector 14 Main Transit Highway"),
    lat: float = Query(26.9124),
    lng: float = Query(75.7873)
):
    """
    AI Executive Natural Language Summary & Speech Alert Text Generator.
    """
    location = {"resolved_address": resolved_address, "lat": lat, "lng": lng}
    return ai_assistant.generate_executive_incident_summary(event_type, severity, location, {})
