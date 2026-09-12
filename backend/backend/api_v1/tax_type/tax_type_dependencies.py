from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.tax_type.tax_type_schema import TaxType as TaxTypeSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.tax_type.tax_type_repository import TaxTypeRepository
from backend.api_v1.tax_type.tax_type_service import TaxTypeService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_tax_type_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> TaxTypeService:
    return TaxTypeService(
        repository=TaxTypeRepository(session=session),
        user=user,
        session=session,
    )


async def tax_type_by_id(
    item_id: int,
    service: TaxTypeService = Depends(get_tax_type_service),
) -> TaxTypeSchema:
    return await service.get_by_id(item_id)
