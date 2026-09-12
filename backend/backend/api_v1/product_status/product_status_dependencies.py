from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.product_status.product_status_schema import ProductStatus as ProductStatusSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.product_status.product_status_repository import ProductStatusRepository
from backend.api_v1.product_status.product_status_service import ProductStatusService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_product_status_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> ProductStatusService:
    return ProductStatusService(
        repository=ProductStatusRepository(session=session),
        user=user,
        session=session,
    )


async def product_status_by_id(
    item_id: int,
    service: ProductStatusService = Depends(get_product_status_service),
) -> ProductStatusSchema:
    return await service.get_by_id(item_id)
