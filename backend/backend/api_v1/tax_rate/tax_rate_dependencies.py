from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.tax_rate.tax_rate_schema import TaxRate as TaxRateSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.tax_rate.tax_rate_repository import TaxRateRepository
from backend.api_v1.tax_rate.tax_rate_service import TaxRateService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_tax_rate_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> TaxRateService:
    return TaxRateService(
        repository=TaxRateRepository(session=session),
        user=user,
        session=session,
    )


async def tax_rate_by_id(
    item_id: int,
    service: TaxRateService = Depends(get_tax_rate_service),
) -> TaxRateSchema:
    return await service.get_by_id(item_id)
