from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.status_type.status_type_repository import StatusTypeRepository
from backend.api_v1.status_type.status_type_service import StatusTypeService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_status_type_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> StatusTypeService:
    return StatusTypeService(
        repository=StatusTypeRepository(session=session),
        user=user,
        session=session,
    )
