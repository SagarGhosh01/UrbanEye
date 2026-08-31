from pydantic_settings import BaseSettings
from typing import List, Union
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Mobile Urban Intelligence Platform (BEL)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "urban-eye-secret-key-for-jwt-signing-production-grade"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # SQLite default, or postgresql+asyncpg://user:pass@host/dbname in production
    DATABASE_URL: str = "sqlite+aiosqlite:///./urban_eye.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Raw Video Bandwidth Benchmark (e.g. 1080p 30fps H.264 stream ~ 4.5 Mbps = 562.5 KB/s)
    RAW_VIDEO_BITRATE_KBPS: float = 4500.0

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
