"""DEV authentication stub.

Lets the app boot and the SPA proceed without a real identity provider. The
real talent flow (LDAP bind + RS256 JWT issued from auth/keys/*.pem) should be
ported here; see auth/README.md. Until then `get_current_active_auth_user`
returns a fixed dev employee and /auth/login accepts any credentials.
"""
from fastapi import APIRouter
from pydantic import BaseModel

from backend.api_v1.employee.employee_schema import EmployeeSchema, LangSchema

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str | None = None
    password: str | None = None


async def get_current_active_auth_user() -> EmployeeSchema:
    # TODO: replace with real JWT decode + LDAP-backed employee lookup.
    return EmployeeSchema(id=1, name="dev", lang_acronym="eng",
                          lang=LangSchema(id=2, short_name="eng", acronym="eng"))


@router.post("/login")
async def login(_: LoginRequest | None = None):
    user = await get_current_active_auth_user()
    return {
        "access_token": "dev-token",
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name,
                 "lang": {"id": 2, "short_name": "eng"}},
    }


@router.get("/me")
async def me():
    return await get_current_active_auth_user()
