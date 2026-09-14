"""JWT auth — single-user login, RS256 tokens, refresh endpoint.

Matches the shape of talent/anee_data jwt_auth so the frontend needs no
changes: POST /jwt/login (form-encoded username+password), returns
{access_token, refresh_token, token_type}.
"""
import os

from fastapi import APIRouter, Depends, Form, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from backend.auth import auth_utils
from backend.api_v1.user_preference.user_preference_service import UserPreferenceService
from backend.api_v1.user_preference.user_preference_dependencies import get_preference_service
from backend.api_v1.user_preference.user_preference_schema import UserProfile, LanguageUpdate
from backend.api_v1.msg.catalog import catalog_cache
from backend.api_v1.employee.employee_schema import LangSchema

router = APIRouter(prefix="/jwt", tags=["JWT"])

http_bearer = HTTPBearer()

AUTH_USER_CODE = os.environ.get("AUTH_USER_CODE", "UKR7101004")
AUTH_USER_PASSWORD = os.environ.get("AUTH_USER_PASSWORD", "111")


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class CurrentUser(BaseModel):
    code: str


def get_current_token_payload(
    credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
) -> dict:
    payload = auth_utils.decode_jwt(token=credentials.credentials)
    auth_utils.validate_token_type(payload, auth_utils.ACCESS_TOKEN_TYPE)
    return payload


def get_current_user(
    payload: dict = Depends(get_current_token_payload),
) -> CurrentUser:
    code = payload.get("sub")
    if code != AUTH_USER_CODE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unknown user",
        )
    return CurrentUser(code=code)


# compatibility alias — 7 dependency files import this name and expect EmployeeSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema


async def get_current_active_auth_user(
    request: Request,
    payload: dict = Depends(get_current_token_payload),
    service: UserPreferenceService = Depends(get_preference_service),
) -> EmployeeSchema:
    code = payload.get("sub")
    if code != AUTH_USER_CODE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unknown user",
        )
    catalog = await catalog_cache.get()
    profile = await service.profile(code, catalog.default_id)
    request.state.lang_id = profile.lang_id
    return EmployeeSchema(id=1, name=code, lang_id=profile.lang_id,
                          lang_acronym=profile.lang.short_name,
                          lang=LangSchema(**profile.lang.model_dump()))


@router.post("/login", response_model=AuthResponse)
async def login(username: str = Form(...), password: str = Form(...)):
    if username.strip().upper() != AUTH_USER_CODE or password != AUTH_USER_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    access_token = auth_utils.create_access_token({"sub": AUTH_USER_CODE})
    refresh_token = auth_utils.create_refresh_token(sub=AUTH_USER_CODE)
    return AuthResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=AuthResponse)
async def refresh(body: RefreshRequest):
    payload = auth_utils.decode_jwt(token=body.refresh_token)
    auth_utils.validate_token_type(payload, auth_utils.REFRESH_TOKEN_TYPE)
    code = payload.get("sub")
    if code != AUTH_USER_CODE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown user"
        )
    access_token = auth_utils.create_access_token({"sub": AUTH_USER_CODE})
    refresh_token = auth_utils.create_refresh_token(sub=AUTH_USER_CODE)
    return AuthResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/users/me", response_model=UserProfile)
async def me(user: EmployeeSchema = Depends(get_current_active_auth_user)):
    return UserProfile(code=user.name, name=user.name, lang_id=user.lang_id, lang=user.lang.model_dump())


@router.patch("/users/me/language", response_model=UserProfile)
async def set_language(body: LanguageUpdate, request: Request,
                       user: EmployeeSchema = Depends(get_current_active_auth_user),
                       service: UserPreferenceService = Depends(get_preference_service)):
    profile = await service.set_language(user.name, body.lang_id)
    request.state.lang_id = profile.lang_id
    return profile
