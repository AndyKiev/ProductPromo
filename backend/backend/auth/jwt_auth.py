"""This app logs its users in itself (vault: Decisions/2026-11-09 Each App Logs In
Itself). Same endpoints as every catalog app, built by pp-common:

- POST /jwt/login (form username + password), POST /jwt/refresh
- GET /jwt/users/me, PATCH /jwt/users/me/language

LDAP like talent (bypass in dev); the matricule must be an active employee in this
app's own copy (fed from the employee service over RabbitMQ); tokens are signed with
this app's key for audience "catalog" only. No other app's token is accepted.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from pp_common.auth import access_payload, build_jwt_router, build_profile
from pp_common.employees import ReplicaEmployeeLookup

from backend.api_v1.employee.employee_model import Employee
from backend.api_v1.user_preference.user_preference_model import UserPreference
from backend.config.config import settings
from backend.database.db_helper import db_helper


async def get_lookup(session: AsyncSession = Depends(db_helper.session_getter)) -> ReplicaEmployeeLookup:
    return ReplicaEmployeeLookup(session, Employee)


get_current_token_payload = access_payload(settings.auth_jwt)
_jwt_router = build_jwt_router(jwt_cfg=settings.auth_jwt, ldap_cfg=settings.ldap, lookup=get_lookup)
_profile_router, get_current_active_auth_user = build_profile(
    access=get_current_token_payload, session=db_helper.session_getter, preference_model=UserPreference)

router = APIRouter()
router.include_router(_jwt_router)
router.include_router(_profile_router)
