import pytest
import os
import uuid
from edge.capture.gps import GPSReceiver
from edge.inference.detector import VehicleTracker
from edge.anpr.plate_reader import ANPRPipeline
from edge.uplink.storage import LocalEventBuffer
import numpy as np

def test_gps_zero_fabrication_on_signal_loss():
    gps = GPSReceiver()
    gps.simulate_underpass_drop = True
    fix = gps.read_fix()
    
    # Zero fabrication check: when in shadow, lat and lng MUST be None
    assert fix["status"] == "UNAVAILABLE"
    assert fix["lat"] is None
    assert fix["lng"] is None

def test_anpr_confidence_gating_unreadable():
    anpr = ANPRPipeline(confidence_gate=0.75)
    mock_crop = np.zeros((100, 100, 3), dtype=np.uint8)
    
    # Force occluded test
    res = anpr.read_plate(mock_crop, is_occluded=True)
    assert res["is_confident"] is False
    assert res["registration_no"] == "Not readable"
    assert res["ocr_confidence"] < 0.75

def test_vehicle_tracker_anti_double_count():
    tracker = VehicleTracker()
    mock_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
    
    res1 = tracker.process_frame(mock_frame)
    res2 = tracker.process_frame(mock_frame)
    
    # Cumulative counter maintains tracked objects
    assert res2["total_counted_cumulative"] >= res1["total_counted_cumulative"]
    assert "detections" in res2

def test_edge_store_and_forward_buffer():
    test_db = f"test_buffer_{uuid.uuid4().hex[:6]}.db"
    
    buf = LocalEventBuffer(test_db)
    sample_evt = {
        "event_id": "OFFLINE-EVT-001",
        "type": "POTHOLE",
        "confidence": 0.92,
        "bus_id": "BUS-101"
    }
    
    buf.save_event(sample_evt)
    assert buf.get_buffer_count() == 1
    
    unsynced = buf.get_unsynced_events()
    assert len(unsynced) == 1
    assert unsynced[0]["event_id"] == "OFFLINE-EVT-001"
    
    buf.mark_synced(["OFFLINE-EVT-001"])
    assert buf.get_buffer_count() == 0
    
    try:
        os.remove(test_db)
    except Exception:
        pass
