"""
UrbanEye AI Predictive Pavement Health Index & Structural Degradation Forecaster
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any

class AIRoadHealthPredictor:
    def calculate_road_health_index(
        self,
        potholes: List[Dict[str, Any]],
        waterlogging_present: bool = False,
        daily_traffic_pcu: float = 1450.0
    ) -> Dict[str, Any]:
        """
        Calculates 0-100 Municipal Road Health Index (RHI) and forecasts structural failure timeline.
        """
        base_health = 100.0
        total_pothole_volume_l = 0.0
        max_depth_cm = 0.0

        for p in potholes:
            dims = p.get("dimensions", {})
            volume = dims.get("volume_litres", 2.5)
            depth = dims.get("depth_cm", 4.0)
            total_pothole_volume_l += volume
            if depth > max_depth_cm:
                max_depth_cm = depth

        # Structural Deductions
        pothole_deduction = min(50.0, (len(potholes) * 12.0) + (total_pothole_volume_l * 1.8))
        waterlog_deduction = 22.0 if waterlogging_present else 0.0
        traffic_wear_deduction = min(15.0, (daily_traffic_pcu / 300.0))

        current_rhi = round(max(5.0, base_health - pothole_deduction - waterlog_deduction - traffic_wear_deduction), 1)

        # AI Degradation Forecasting Model
        # Degradation rate (points lost per day) accelerates with waterlogging & heavy traffic
        daily_decay_rate = 0.45 + (1.2 if waterlogging_present else 0.15) + (total_pothole_volume_l * 0.08)
        days_to_failure = max(1, int((current_rhi - 25.0) / float(daily_decay_rate))) if current_rhi > 25.0 else 0

        predicted_failure_date = (datetime.utcnow() + timedelta(days=days_to_failure)).strftime("%Y-%m-%d")

        # Maintenance Priority Level
        if current_rhi < 40.0:
            priority = "URGENT PWD DISPATCH REQUIRED"
            severity_badge = "CRITICAL"
        elif current_rhi < 70.0:
            priority = "SCHEDULED REPAIR WATCHLIST"
            severity_badge = "MEDIUM"
        else:
            priority = "PRISTINE CONDITION"
            severity_badge = "NORMAL"

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "road_health_index": current_rhi,
            "condition_rating": "CRITICAL DEFECTS" if current_rhi < 40 else "MODERATE DETERIORATION" if current_rhi < 70 else "GOOD",
            "active_potholes_count": len(potholes),
            "total_defect_volume_litres": round(total_pothole_volume_l, 1),
            "max_defect_depth_cm": round(max_depth_cm, 1),
            "predictive_decay_forecast": {
                "daily_decay_rate_rhi": round(daily_decay_rate, 2),
                "estimated_days_to_structural_failure": days_to_failure,
                "predicted_failure_date": predicted_failure_date
            },
            "maintenance_recommendation": {
                "priority_level": priority,
                "severity_badge": severity_badge,
                "recommended_patch_asphalt_tons": round(max(0.5, total_pothole_volume_l * 0.0024), 2)
            }
        }

road_health_predictor = AIRoadHealthPredictor()
