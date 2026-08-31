from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
from jose import jwt
import hashlib
import os
import secrets
from enum import Enum
from .config import settings

class UserRole(str, Enum):
    VIEWER = "viewer"
    ANALYST = "analyst"
    ADMIN = "admin"
    LAW_ENFORCEMENT_LIAISON = "law_enforcement_liaison"

def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    pw_hash = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"{salt}${pw_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or '$' not in hashed_password:
        return False
    salt, original_hash = hashed_password.split('$', 1)
    test_hash = hashlib.sha256((salt + plain_password).encode('utf-8')).hexdigest()
    return secrets.compare_digest(test_hash, original_hash)

def create_access_token(subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
