import time
import argparse
import logging
import uuid
import datetime
from .config import config
from .capture.camera import VideoCaptureSource
from .capture.gps import GPSReceiver
from .inference.detector import VehicleTracker
from .hazard.hazard_detector import HazardDetector
from .anpr.plate_reader import ANPRPipeline
from .incident.incident_rules import IncidentRuleEngine
from .uplink.client import EdgeUplinkClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [EDGE-%(process)d] %(levelname)s: %(message)s")
logger = logging.getLogger("UrbanEye.Edge")

def run_edge_daemon(bus_id: str = config.BUS_ID, fps: int = 10, offline_mode: bool = False):
    logger.info(f"Starting UrbanEye Edge Compute Node for Bus: {bus_id} (Target FPS: {fps})")
    
    camera = VideoCaptureSource(source_type="synthetic")
    gps = GPSReceiver()
    tracker = VehicleTracker()
    hazard_detector = HazardDetector()
    anpr = ANPRPipeline()
    incident_engine = IncidentRuleEngine()
    uplink = EdgeUplinkClient()
    
    if offline_mode:
        uplink.is_online = False
        logger.warning("Running in OFFLINE MODE: All events will be buffered in local SQLite store.")

    frame_interval = 1.0 / fps
    cycle = 0

    try:
        while True:
            t0 = time.time()
            cycle += 1
            
            # 1. Capture Camera Frame
            ret, frame_arr, b64_frame = camera.read()
            if not ret:
                time.sleep(0.1)
                continue

            # 2. Ingest GPS
            gps_data = gps.read_fix()

            # 3. Inference: Vehicle & Pedestrian Tracking
            tracking_res = tracker.process_frame(frame_arr)

            # 4. Periodic Vehicle Density Snapshot (every 30 cycles)
            if cycle % 30 == 0:
                counts = tracking_res["counts_by_class"]
                snapshot = {
                    "bus_id": bus_id,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "lat": gps_data["lat"],
                    "lng": gps_data["lng"],
                    "cars": counts.get("car", 0),
                    "motorcycles": counts.get("motorcycle", 0),
                    "buses": counts.get("bus", 0),
                    "trucks": counts.get("truck", 0),
                    "auto_rickshaws": counts.get("auto_rickshaw", 0),
                    "pedestrians": counts.get("pedestrian", 0),
                    "total_vehicles": tracking_res["total_counted_cumulative"],
                    "density_level": tracking_res["density_level"]
                }
                uplink.send_vehicle_snapshot(snapshot)

            # 5. Send GPS Telemetry (every 10 cycles)
            if cycle % 10 == 0 and gps_data["lat"] is not None:
                uplink.send_telemetry(
                    bus_id=bus_id,
                    lat=gps_data["lat"],
                    lng=gps_data["lng"],
                    speed_kmh=gps_data["speed_kmh"],
                    heading_deg=gps_data["heading_deg"]
                )

            # 6. Road Hazard Detection
            detected_hazards = hazard_detector.analyze_road_hazards(frame_arr)
            for hz in detected_hazards:
                event_id = f"EVT-{datetime.datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
                
                event_payload = {
                    "event_id": event_id,
                    "type": hz["type"],
                    "confidence": hz["confidence"],
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "location": {
                        "lat": gps_data["lat"],
                        "lng": gps_data["lng"],
                        "accuracy_m": gps_data["accuracy_m"],
                        "status": gps_data["status"]
                    },
                    "bus_id": bus_id,
                    "camera_id": config.CAMERA_ID,
                    "severity": hz["severity"],
                    "status": "NEW",
                    "evidence": {
                        "thumbnail_base64": b64_frame,
                        "clip_url": f"/evidence/clips/{event_id}.mp4"
                    },
                    "metadata": {
                        "model_version": config.HAZARD_MODEL_VERSION,
                        "edge_device_id": config.DEVICE_ID,
                        "bounding_boxes": [
                            {"label": hz["type"].lower(), "bbox": hz["bbox"], "conf": hz["confidence"]}
                        ],
                        "extra": hz.get("extra", {})
                    }
                }
                uplink.transmit_event(event_payload)

            # 7. Incident / Near-Miss Analysis
            incident = incident_engine.evaluate_trajectories(tracking_res["detections"], gps_data["speed_kmh"])
            if incident:
                event_id = f"EVT-{datetime.datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
                
                # Check ANPR for offending/involved vehicle
                plate_read = anpr.read_plate(frame_arr)
                
                event_payload = {
                    "event_id": event_id,
                    "type": incident["type"],
                    "confidence": incident["confidence"],
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "location": {
                        "lat": gps_data["lat"],
                        "lng": gps_data["lng"],
                        "accuracy_m": gps_data["accuracy_m"],
                        "status": gps_data["status"]
                    },
                    "bus_id": bus_id,
                    "camera_id": config.CAMERA_ID,
                    "severity": incident["severity"],
                    "status": "NEW",
                    "evidence": {
                        "thumbnail_base64": b64_frame,
                        "clip_url": f"/evidence/clips/{event_id}.mp4"
                    },
                    "metadata": {
                        "model_version": config.MODEL_VERSION,
                        "edge_device_id": config.DEVICE_ID,
                        "bounding_boxes": [
                            {"label": incident["type"].lower(), "bbox": [400, 380, 240, 160], "conf": incident["confidence"]}
                        ],
                        "extra": {
                            "description": incident["description"],
                            "vehicle_type": "CAR"
                        }
                    },
                    "anpr_plate": plate_read["registration_no"],
                    "anpr_confidence": plate_read["ocr_confidence"]
                }
                uplink.transmit_event(event_payload)

            # Periodic bandwidth log report
            if cycle % 50 == 0:
                stats = uplink.get_bandwidth_savings_stats()
                logger.info(f"Edge Status: {stats['events_transmitted']} events sent | "
                            f"Bandwidth Saved: {stats['savings_pct']}% | "
                            f"Buffered: {stats['buffered_pending']} items")

            elapsed = time.time() - t0
            sleep_time = max(0.01, frame_interval - elapsed)
            time.sleep(sleep_time)

    except KeyboardInterrupt:
        logger.info("Edge daemon stopped by user.")
    finally:
        camera.release()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="UrbanEye Edge Compute Daemon")
    parser.add_argument("--bus-id", type=str, default=config.BUS_ID, help="Identifier of the host bus")
    parser.add_argument("--fps", type=int, default=10, help="Inference processing FPS")
    parser.add_argument("--offline", action="store_true", help="Simulate edge offline buffering")
    args = parser.parse_args()

    run_edge_daemon(bus_id=args.bus_id, fps=args.fps, offline_mode=args.offline)
