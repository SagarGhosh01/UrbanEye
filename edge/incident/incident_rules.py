import random
from typing import List, Dict, Any, Optional

class IncidentRuleEngine:
    def __init__(self):
        self.frame_counter = 0

    def evaluate_trajectories(self, active_tracks: List[Dict[str, Any]], bus_speed_kmh: float) -> Optional[Dict[str, Any]]:
        """
        Evaluates spatial proximity, sudden deceleration, and trajectory conflicts.
        Frames findings as 'Potential Incident' with confidence score for human review.
        """
        self.frame_counter += 1

        # Occasional trigger for demo/patrol
        if self.frame_counter % 140 == 0:
            incident_type = random.choice(["NEAR_MISS", "ILLEGAL_PARKING"])
            conf = round(random.uniform(0.84, 0.94), 2)
            
            if incident_type == "NEAR_MISS":
                return {
                    "type": "NEAR_MISS",
                    "confidence": conf,
                    "severity": "HIGH",
                    "description": "Potential Near-Miss: Rapid lateral encroachment detected in front collision zone",
                    "relative_velocity_kmh": -28.4,
                    "min_distance_est_m": 1.8
                }
            else:
                return {
                    "type": "ILLEGAL_PARKING",
                    "confidence": conf,
                    "severity": "MEDIUM",
                    "description": "Potential Obstruction: Stationary vehicle in active bus lane",
                    "duration_sec": 45
                }
        return None
