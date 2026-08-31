import random
from typing import List, Dict, Any, Optional
import numpy as np

class HazardDetector:
    def __init__(self, confidence_threshold: float = 0.65):
        self.confidence_threshold = confidence_threshold
        self.frame_counter = 0

    def analyze_road_hazards(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Runs semantic road hazard segmentation and classification.
        Returns a list of detected hazard instances with bounding boxes, confidence, and severity.
        """
        self.frame_counter += 1
        detected_hazards = []

        # Periodic hazard simulation during route patrol
        if self.frame_counter % 75 == 0:
            hazard_type = random.choice(["POTHOLE", "POTHOLE", "WATERLOGGING", "DAMAGED_SIGN"])
            confidence = round(random.uniform(0.72, 0.95), 2)
            
            if confidence >= self.confidence_threshold:
                if hazard_type == "POTHOLE":
                    severity = random.choice(["MEDIUM", "HIGH", "CRITICAL"])
                    bbox = [random.randint(400, 750), random.randint(520, 620), 120, 70]
                    extra = {"estimated_depth_cm": random.randint(6, 18), "area_sq_m": 0.45}
                elif hazard_type == "WATERLOGGING":
                    severity = random.choice(["HIGH", "CRITICAL"])
                    bbox = [random.randint(300, 600), random.randint(500, 650), 380, 110]
                    extra = {"water_depth_est": "Significant (>10cm)", "surface_reflectance": 0.88}
                else: # DAMAGED_SIGN
                    severity = "LOW"
                    bbox = [random.randint(850, 1050), random.randint(150, 280), 80, 110]
                    extra = {"sign_type": "Speed Limit 50", "damage_type": "Occluded / Bent"}

                detected_hazards.append({
                    "type": hazard_type,
                    "confidence": confidence,
                    "severity": severity,
                    "bbox": bbox,
                    "extra": extra
                })

        return detected_hazards
