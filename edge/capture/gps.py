import time
import math
from typing import Dict, Any, Optional

class GPSReceiver:
    def __init__(self, initial_lat: float = 28.6289, initial_lng: float = 77.2065):
        self.lat = initial_lat
        self.lng = initial_lng
        self.speed_kmh = 32.5
        self.heading_deg = 135.0
        self.accuracy_m = 4.2
        self.step_idx = 0
        self.simulate_underpass_drop = False
        
    def read_fix(self) -> Dict[str, Any]:
        """
        Reads GPS coordinates.
        Adheres strictly to the Zero-Fabrication Rule:
        If signal is lost in an underpass/tunnel, lat and lng are None, status is UNAVAILABLE.
        """
        self.step_idx += 1
        
        # Every 120 steps, simulate a 10-step underpass GPS shadow
        is_in_shadow = (self.step_idx % 120 >= 105 and self.step_idx % 120 <= 115) or self.simulate_underpass_drop
        
        if is_in_shadow:
            return {
                "lat": None,
                "lng": None,
                "accuracy_m": None,
                "status": "UNAVAILABLE",
                "speed_kmh": 0.0,
                "heading_deg": self.heading_deg,
                "timestamp": time.time()
            }
            
        # Realistic circular transit corridor progression
        rad = math.radians(self.step_idx * 2)
        self.lat += 0.0003 * math.cos(rad)
        self.lng += 0.0003 * math.sin(rad)
        self.speed_kmh = max(15.0, min(52.0, 32.0 + 12.0 * math.sin(rad * 3)))
        self.heading_deg = (self.heading_deg + 1.5) % 360.0
        
        return {
            "lat": round(self.lat, 6),
            "lng": round(self.lng, 6),
            "accuracy_m": round(self.accuracy_m, 1),
            "status": "LOCKED",
            "speed_kmh": round(self.speed_kmh, 1),
            "heading_deg": round(self.heading_deg, 1),
            "timestamp": time.time()
        }
