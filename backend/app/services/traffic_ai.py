"""
UrbanEye AI Predictive Traffic Optimization & Adaptive Signal Timing Engine
"""
import numpy as np
from datetime import datetime
from typing import Dict, List, Any

class AITrafficOptimizer:
    def __init__(self):
        self.flow_history = []

    def analyze_traffic_flow(self, vehicle_counts: Dict[str, int], current_speed_kmh: float = 28.5) -> Dict[str, Any]:
        """
        Calculates Level of Service (LOS), Passenger Car Units (PCU/hr), 
        15-minute predictive congestion forecast, and adaptive signal timing recommendations.
        """
        cars = vehicle_counts.get("car", 0)
        buses = vehicle_counts.get("bus", 0)
        trucks = vehicle_counts.get("truck", 0)
        motorcycles = vehicle_counts.get("motorcycle", 0)
        rickshaws = vehicle_counts.get("auto_rickshaw", 0)
        pedestrians = vehicle_counts.get("pedestrian", 0)

        # Passenger Car Equivalent (PCE) Weighting Standard
        pcu = (cars * 1.0) + (buses * 2.5) + (trucks * 3.0) + (motorcycles * 0.5) + (rickshaws * 1.2)
        
        total_vehicles = sum(vehicle_counts.values()) - pedestrians
        
        # Determine Level of Service (LOS A to F)
        if pcu < 5:
            los = "LOS-A (Free Flow)"
            congestion_risk = 12.0
            speed_ratio = 1.0
        elif pcu < 12:
            los = "LOS-B (Reasonably Free Flow)"
            congestion_risk = 32.0
            speed_ratio = 0.85
        elif pcu < 22:
            los = "LOS-C (Stable Flow)"
            congestion_risk = 58.0
            speed_ratio = 0.68
        elif pcu < 35:
            los = "LOS-D (Approaching Instability)"
            congestion_risk = 79.0
            speed_ratio = 0.48
        else:
            los = "LOS-F (Breakdown Congestion / Gridlock)"
            congestion_risk = 96.0
            speed_ratio = 0.22

        # 15-Minute Predictive Markov Traffic Trend
        forecast_pcu_15m = round(pcu * (1.15 if current_speed_kmh < 20 else 0.95), 1)
        predicted_status = "CRITICAL BOTTLENECK EXPECTED" if forecast_pcu_15m > 25 else "STABLE FLOW PREDICTED"

        # Adaptive AI Traffic Signal Timing Recommendation
        base_green_sec = 30
        if pcu > 20:
            recommended_green = base_green_sec + min(35, int((pcu - 15) * 1.8))
            signal_action = f"EXTEND GREEN PHASE BY +{recommended_green - base_green_sec}s ON MAIN CORRIDOR"
        else:
            recommended_green = base_green_sec
            signal_action = "MAINTAIN BALANCED 30s SIGNAL CYCLE"

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "pcu_count": round(pcu, 1),
            "level_of_service": los,
            "congestion_risk_pct": congestion_risk,
            "estimated_speed_kmh": round(max(5.0, current_speed_kmh * speed_ratio), 1),
            "predictive_15m_forecast": {
                "predicted_pcu": forecast_pcu_15m,
                "status": predicted_status
            },
            "ai_signal_recommendation": {
                "current_cycle_sec": base_green_sec,
                "recommended_green_sec": recommended_green,
                "action": signal_action
            }
        }

traffic_optimizer = AITrafficOptimizer()
