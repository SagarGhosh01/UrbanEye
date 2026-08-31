import httpx
import logging
import json
from typing import Dict, Any, List
from .storage import LocalEventBuffer
from ..config import config

logger = logging.getLogger("UrbanEye.EdgeUplink")

class EdgeUplinkClient:
    def __init__(self, backend_url: str = config.BACKEND_URL):
        self.backend_url = backend_url
        self.buffer = LocalEventBuffer(config.LOCAL_DB_PATH)
        self.is_online = True
        self.total_bytes_sent = 0
        self.total_events_sent = 0
        self.raw_video_baseline_bytes = 0.0

    def transmit_event(self, event_data: Dict[str, Any]) -> bool:
        """
        Attempts to transmit event to central backend.
        If offline or connection errors, buffers event to local SQLite.
        """
        payload_json = json.dumps(event_data, default=str)
        payload_bytes = len(payload_json.encode('utf-8'))
        
        # 5 seconds of 1080p @ 4.5Mbps raw video baseline = ~2.81 MB
        self.raw_video_baseline_bytes += (config.RAW_VIDEO_BITRATE_KBPS * 1024 / 8) * 5.0

        if not self.is_online:
            self.buffer.save_event(event_data)
            return False

        try:
            with httpx.Client(timeout=3.0) as client:
                resp = client.post(
                    f"{self.backend_url}{config.API_V1}/events/ingest",
                    json=event_data
                )
                if resp.status_code in [200, 201]:
                    self.total_bytes_sent += payload_bytes
                    self.total_events_sent += 1
                    logger.info(f"Successfully transmitted event {event_data['event_id']}")
                    # If we had buffered events, attempt to flush
                    self.sync_buffered_events()
                    return True
                else:
                    logger.warning(f"Backend returned status {resp.status_code}. Buffering locally.")
                    self.buffer.save_event(event_data)
                    return False
        except Exception as e:
            logger.warning(f"Network uplink error ({e}). Buffering event locally.")
            self.buffer.save_event(event_data)
            return False

    def sync_buffered_events(self):
        """
        Flushes un-synced events from local SQLite store to central backend in batch.
        """
        unsynced = self.buffer.get_unsynced_events(limit=50)
        if not unsynced:
            return

        try:
            with httpx.Client(timeout=5.0) as client:
                resp = client.post(
                    f"{self.backend_url}{config.API_V1}/events/batch-ingest",
                    json=unsynced
                )
                if resp.status_code in [200, 201]:
                    synced_ids = [e["event_id"] for e in unsynced]
                    self.buffer.mark_synced(synced_ids)
                    logger.info(f"Successfully store-and-forward synced {len(synced_ids)} buffered events!")
        except Exception as e:
            logger.debug(f"Store-and-forward batch sync pending network stability: {e}")

    def send_telemetry(self, bus_id: str, lat: float, lng: float, speed_kmh: float, heading_deg: float):
        if not self.is_online or lat is None:
            return
        try:
            with httpx.Client(timeout=2.0) as client:
                client.post(
                    f"{self.backend_url}{config.API_V1}/fleet/telemetry",
                    params={
                        "bus_id": bus_id,
                        "lat": lat,
                        "lng": lng,
                        "speed_kmh": speed_kmh,
                        "heading_deg": heading_deg
                    }
                )
        except Exception:
            pass

    def send_vehicle_snapshot(self, snapshot: Dict[str, Any]):
        if not self.is_online:
            return
        try:
            with httpx.Client(timeout=2.0) as client:
                client.post(
                    f"{self.backend_url}{config.API_V1}/fleet/vehicle-snapshot",
                    json=snapshot
                )
        except Exception:
            pass

    def get_bandwidth_savings_stats(self) -> Dict[str, Any]:
        savings_pct = 0.0
        if self.raw_video_baseline_bytes > 0:
            savings_pct = (1.0 - (self.total_bytes_sent / self.raw_video_baseline_bytes)) * 100.0
        return {
            "total_bytes_sent": self.total_bytes_sent,
            "raw_video_baseline_bytes": self.raw_video_baseline_bytes,
            "savings_pct": round(savings_pct, 2),
            "events_transmitted": self.total_events_sent,
            "buffered_pending": self.buffer.get_buffer_count()
        }
