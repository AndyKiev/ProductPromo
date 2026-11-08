"""This service's token settings bound to the shared pp_common.auth helpers.

Login and refresh still live in this service until ProductPromo-auth takes
them over; then only `decode_jwt` (verification with the public key) stays.
"""
from pp_common import auth as tokens
from pp_common.auth import ACCESS_TOKEN_TYPE, REFRESH_TOKEN_TYPE, validate_token_type  # noqa: F401

from backend.config.config import settings


def decode_jwt(token: str | bytes) -> dict:
    return tokens.decode_jwt(token, settings.auth_jwt)


def create_access_token(payload: dict) -> str:
    return tokens.create_access_token(payload, settings.auth_jwt)


def create_refresh_token(sub: str) -> str:
    return tokens.create_refresh_token(sub, settings.auth_jwt)
