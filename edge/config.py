import os

class EdgeConfig:
    BUS_ID: str = os.getenv("URBANEYE_BUS_ID", "BUS-101")
    CAMERA_ID: str = os.getenv("URBANEYE_CAMERA_ID", "FRONT")
    DEVICE_ID: str = os.getenv("URBANEYE_DEVICE_ID", "EDGE-101")
    BACKEND_URL: str = os.getenv("URBANEYE_BACKEND_URL", "http://localhost:8000")
    API_V1: str = "/api/v1"
    
    # Inference thresholds
    DETECTION_CONF_THRESHOLD: float = 0.50
    HAZARD_CONF_THRESHOLD: float = 0.65
    ANPR_CONF_THRESHOLD: float = 0.75  # Plates below this threshold reported honestly as "Not readable"
    
    # Models
    MODEL_VERSION: str = "yolov8n-urbaneye-v3.2"
    HAZARD_MODEL_VERSION: str = "deeplabv3p-hazard-v1.4"
    ANPR_MODEL_VERSION: str = "crnn-indian-plate-v2.1"
    
    # Store and Forward local DB path
    LOCAL_DB_PATH: str = "edge_buffer.db"
    
    # Bandwidth calculation benchmark (1080p @ 30fps H.264 stream bitrate in kbps)
    RAW_VIDEO_BITRATE_KBPS: float = 4500.0

config = EdgeConfig()
