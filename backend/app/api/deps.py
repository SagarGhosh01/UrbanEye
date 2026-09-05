from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..core.config import settings
from ..db.database import get_db
from ..db.models import User
from ..schemas.auth import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        state_id: str = payload.get("state_id")
        district_id: str = payload.get("district_id")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role, state_id=state_id, district_id=district_id)
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.username == token_data.username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user


def require_roles(allowed_roles: List[str]):
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles and current_user.role != "national_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: role '{current_user.role}' not authorized. Required: {allowed_roles}"
            )
        return current_user
    return role_checker


def require_district_scope():
    """Enforces that district_head users can only access their own district's data."""
    async def scope_checker(current_user: User = Depends(get_current_user)):
        return current_user
    return scope_checker


def get_scoped_district_id(current_user: User) -> str | None:
    """Returns the district_id the user is scoped to, or None for admins who see all."""
    if current_user.role == "district_head":
        return current_user.district_id
    return None


def get_scoped_state_id(current_user: User) -> str | None:
    """Returns the state_id the user is scoped to, or None for national admins."""
    if current_user.role == "state_admin":
        return current_user.state_id
    if current_user.role == "district_head":
        return current_user.state_id
    return None
