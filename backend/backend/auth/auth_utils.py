"""Token machinery — RS256 JWT encode/decode + access/refresh token creation.

Uses the same auth_utils shape as talent/anee_data so the frontend axios
interceptor and login flow need no changes when lifted into EDI.
"""
from datetime import timedelta, timezone, datetime

from fastapi import HTTPException, status
from jwt.exceptions import InvalidTokenError
import jwt

from backend.config.config import settings

TOKEN_TYPE_FIELD = "type"
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


def encode_jwt(
    payload: dict,
    private_key: str | None = None,
    algorithm: str | None = None,
    expire_minutes: int | None = None,
    expire_timedelta: timedelta | None = None,
) -> str:
    private_key = private_key or settings.auth_jwt.private_key_path.read_text()
    algorithm = algorithm or settings.auth_jwt.algorithm
    expire_minutes = expire_minutes or settings.auth_jwt.access_token_expire_minutes

    to_encode = payload.copy()
    now = datetime.now(timezone.utc)
    expire = (
        now + expire_timedelta
        if expire_timedelta
        else now + timedelta(minutes=expire_minutes)
    )
    to_encode.update(exp=expire, iat=now)
    return jwt.encode(to_encode, private_key, algorithm)


def decode_jwt(
    token: str | bytes,
    public_key: str | None = None,
    algorithm: str | None = None,
) -> dict:
    public_key = public_key or settings.auth_jwt.public_key_path.read_text()
    algorithm = algorithm or settings.auth_jwt.algorithm
    try:
        return jwt.decode(token, public_key, algorithms=[algorithm])
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid token error",
        )


def create_access_token(payload: dict) -> str:
    """Short-lived token used as Bearer credential on every request."""
    to_encode = {TOKEN_TYPE_FIELD: ACCESS_TOKEN_TYPE, **payload}
    return encode_jwt(to_encode, expire_minutes=settings.auth_jwt.access_token_expire_minutes)


def create_refresh_token(sub: str) -> str:
    """Long-lived token whose only job is to mint new access tokens."""
    to_encode = {TOKEN_TYPE_FIELD: REFRESH_TOKEN_TYPE, "sub": sub}
    return encode_jwt(
        to_encode,
        expire_timedelta=timedelta(days=settings.auth_jwt.refresh_token_expire_days),
    )


def validate_token_type(payload: dict, expected_type: str) -> None:
    if payload.get(TOKEN_TYPE_FIELD) != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )