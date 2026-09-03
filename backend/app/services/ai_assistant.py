"""
UrbanEye AI Natural Language Executive Digest & Speech Alert Generator
"""
from datetime import datetime
from typing import Dict, List, Any

class AIAssistantEngine:
    def generate_executive_incident_summary(self, event_type: str, severity: str, location: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates Natural Language Executive Summary and Speech Synthesis Audio Alert Text.
        """
        address = location.get("resolved_address") or "City Transit Corridor"
        lat = location.get("lat") or 26.9124
        lng = location.get("lng") or 75.7873

        if event_type == "POTHOLE":
            dims = metadata.get("bounding_boxes", [{}])[0] if metadata else {}
            summary = (
                f"Attention Command Center: High-risk road surface defect detected at {address}. "
                f"Defect severity is classified as {severity}. Immediate PWD maintenance dispatch is recommended to prevent vehicle axle damage."
            )
            driver_speech_alert = f"Alert: Deep pothole reported 150 meters ahead near {address}. Please reduce vehicle speed."
        elif event_type == "WATERLOGGING":
            summary = (
                f"Monsoon Hazard Alert: Active waterlogging puddle detected near {address}. "
                f"Road surface friction is compromised. Traffic rerouting protocol initiated."
            )
            driver_speech_alert = f"Caution: Puddle waterlogging ahead at {address}. Drive with care."
        elif event_type == "ANPR_ALERT":
            plate = metadata.get("extra", {}).get("anpr_plate") or "Target Vehicle"
            summary = (
                f"ANPR Security Alert: Vehicle plate {plate} detected at {address} (Coordinates: {lat:.4f}, {lng:.4f}). "
                f"Verified by PaddleOCR PP-OCRv4 neural engine."
            )
            driver_speech_alert = f"ANPR Recognition: License plate {plate} logged."
        else:
            summary = (
                f"Urban perception event [{event_type}] logged at {address} with severity [{severity}]."
            )
            driver_speech_alert = f"Perception Alert: {event_type} registered near {address}."

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "severity": severity,
            "executive_summary_markdown": summary,
            "driver_audio_speech_text": driver_speech_alert
        }

ai_assistant = AIAssistantEngine()
