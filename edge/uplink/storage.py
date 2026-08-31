import sqlite3
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("UrbanEye.EdgeStorage")

class LocalEventBuffer:
    def __init__(self, db_path: str = "edge_buffer.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS buffered_events (
                    event_id TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_synced INTEGER DEFAULT 0,
                    sync_attempts INTEGER DEFAULT 0
                )
            """)
            conn.commit()

    def save_event(self, event_data: Dict[str, Any]):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT OR REPLACE INTO buffered_events (event_id, payload, is_synced) VALUES (?, ?, 0)",
                    (event_data["event_id"], json.dumps(event_data, default=str))
                )
                conn.commit()
                logger.info(f"Buffered event {event_data['event_id']} locally.")
        except Exception as e:
            logger.error(f"Failed to buffer event locally: {e}")

    def get_unsynced_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        results = []
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT payload FROM buffered_events WHERE is_synced = 0 LIMIT ?", (limit,))
                rows = cursor.fetchall()
                for row in rows:
                    results.append(json.loads(row[0]))
        except Exception as e:
            logger.error(f"Error fetching unsynced events: {e}")
        return results

    def mark_synced(self, event_ids: List[str]):
        if not event_ids:
            return
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                placeholders = ",".join("?" for _ in event_ids)
                cursor.execute(f"UPDATE buffered_events SET is_synced = 1 WHERE event_id IN ({placeholders})", event_ids)
                conn.commit()
                logger.info(f"Marked {len(event_ids)} events as synced in local buffer.")
        except Exception as e:
            logger.error(f"Error marking events synced: {e}")

    def get_buffer_count(self) -> int:
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM buffered_events WHERE is_synced = 0")
                return cursor.fetchone()[0]
        except Exception:
            return 0
