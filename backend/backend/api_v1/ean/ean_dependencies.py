from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.ean.ean_schema import Ean as EanSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.ean.ean_repository import EanRepository
from backend.api_v1.ean.ean_service import EanService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_ean_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> EanService:
    return EanService(
        repository=EanRepository(session=session),
        user=user,
        session=session,
    )


async def ean_by_id(
    item_id: int,
    service: EanService = Depends(get_ean_service),
) -> EanSchema:
    return await service.get_by_id(item_id)
