import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger("UrbanEye.InfrastructureDiff")

# Stored Municipal / OSM Infrastructure Baseline Database (segment_id, type, geometry/expected_count)
_EXPECTED_INFRASTRUCTURE_TABLE: Dict[str, List[Dict[str, Any]]] = {
    # Default Transit Segment (Barakhamba / Connaught Place Corridor)
    "SEG-DEL-001": [
        {"type": "ROAD_DIVIDER", "name": "Concrete Median Barrier", "expected_present": True, "geom": "centerline"},
        {"type": "ZEBRA_CROSSING", "name": "Pedestrian Zebra Crossing", "expected_present": True, "geom": "intersection_4"},
        {"type": "SIGNBOARD", "name": "Speed Limit 50 km/h Sign", "expected_present": True, "geom": "pole_marker_12"}
    ],
    "SEG-DEL-002": [
        {"type": "ROAD_DIVIDER", "name": "Raised Asphalt Divider", "expected_present": True, "geom": "centerline"},
        {"type": "ZEBRA_CROSSING", "name": "Signalized Crossing", "expected_present": True, "geom": "signal_gate_1"}
    ],
    "DEFAULT": [
        {"type": "ROAD_DIVIDER", "name": "Central Road Divider", "expected_present": True, "geom": "centerline"},
        {"type": "ZEBRA_CROSSING", "name": "Zebra Crossing", "expected_present": True, "geom": "junction_cross"},
        {"type": "SIGNBOARD", "name": "Mandatory Speed/Traffic Signboard", "expected_present": True, "geom": "side_pole"}
    ]
}

# Observation Tracker to track absence across multiple passes before raising an event
# Key: segment_id + hazard_type, Value: pass history
_ABSENCE_PASS_TRACKER: Dict[str, Dict[str, Any]] = {}

class ReferenceLayoutDiffModule:
    """
    Section 19.2 (B) Absence-Based Hazard Pipeline:
    Detects absence of expected road infrastructure (Missing Dividers, Missing Zebra Crossings, Missing Signboards).
    Compares live frame detections against stored `expected_infrastructure` baseline.
    Only raises an event after absence is confirmed across MULTIPLE PASSES (prevents bad-angle false flags).
    """

    @staticmethod
    def evaluate_infrastructure_absence(
        segment_id: str,
        detected_objects: List[Dict[str, Any]],
        detected_hazards: List[Dict[str, Any]],
        bus_id: str = "BUS-101"
    ) -> List[Dict[str, Any]]:

        absence_events = []
        expected_items = _EXPECTED_INFRASTRUCTURE_TABLE.get(segment_id, _EXPECTED_INFRASTRUCTURE_TABLE["DEFAULT"])

        # Extract labels present in live frame
        present_labels = set()
        for det in detected_objects:
            present_labels.add(det.get("label", "").lower())
        for hz in detected_hazards:
            present_labels.add(hz.get("type", "").lower())

        # Evaluate each expected infrastructure item
        for item in expected_items:
            itype = item["type"]
            
            # Determine if present in current frame
            is_present = False
            if itype == "ROAD_DIVIDER":
                is_present = any(l in present_labels for l in ["divider", "median", "barrier", "road_divider"])
            elif itype == "ZEBRA_CROSSING":
                is_present = any(l in present_labels for l in ["zebra", "crossing", "pedestrian_crossing"])
            elif itype == "SIGNBOARD":
                is_present = any(l in present_labels for l in ["sign", "signboard", "traffic_light", "damaged_sign"])

            tracker_key = f"{segment_id}:{itype}"
            if tracker_key not in _ABSENCE_PASS_TRACKER:
                _ABSENCE_PASS_TRACKER[tracker_key] = {
                    "absent_passes": 0,
                    "total_passes": 0,
                    "last_seen": None
                }

            record = _ABSENCE_PASS_TRACKER[tracker_key]
            record["total_passes"] += 1

            if not is_present:
                record["absent_passes"] += 1
            else:
                record["absent_passes"] = max(0, record["absent_passes"] - 1)
                record["last_seen"] = datetime.utcnow()

            # Raise an Absence Event ONLY when absence is confirmed across >= 2 passes
            if record["absent_passes"] >= 2:
                event_type = f"MISSING_{itype}"
                severity = "HIGH" if itype in ["ROAD_DIVIDER", "ZEBRA_CROSSING"] else "MEDIUM"
                
                absence_events.append({
                    "type": event_type,
                    "confidence": round(min(0.96, 0.75 + (record["absent_passes"] * 0.08)), 2),
                    "severity": severity,
                    "absent_passes_count": record["absent_passes"],
                    "infrastructure_name": item["name"],
                    "baseline_segment_id": segment_id,
                    "reason": f"Expected {item['name']} not detected across {record['absent_passes']} consecutive transit passes"
                })

        return absence_events

infrastructure_diff_module = ReferenceLayoutDiffModule()
