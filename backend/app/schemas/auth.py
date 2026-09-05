from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    state_id: Optional[str] = None
    district_id: Optional[str] = None
    state_name: Optional[str] = None
    district_name: Optional[str] = None


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    state_id: Optional[str] = None
    district_id: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str = "district_head"
    state_id: Optional[str] = None
    district_id: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    state_id: Optional[str] = None
    district_id: Optional[str] = None

    class Config:
        from_attributes = True
