from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.family.family_schema import Family as FamilySchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.family.family_repository import FamilyRepository
from backend.api_v1.family.family_service import FamilyService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_family_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> FamilyService:
    return FamilyService(
        repository=FamilyRepository(session=session),
        user=user,
        session=session,
    )


async def family_by_id(
    family_id: int,
    service: FamilyService = Depends(get_family_service),
) -> FamilySchema:
    return await service.get_by_id(family_id)
