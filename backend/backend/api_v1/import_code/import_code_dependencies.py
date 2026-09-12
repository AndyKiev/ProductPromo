from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.import_code.import_code_schema import ImportCode as ImportCodeSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.import_code.import_code_repository import ImportCodeRepository
from backend.api_v1.import_code.import_code_service import ImportCodeService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_import_code_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> ImportCodeService:
    return ImportCodeService(
        repository=ImportCodeRepository(session=session),
        user=user,
        session=session,
    )


async def import_code_by_id(
    item_id: int,
    service: ImportCodeService = Depends(get_import_code_service),
) -> ImportCodeSchema:
    return await service.get_by_id(item_id)
