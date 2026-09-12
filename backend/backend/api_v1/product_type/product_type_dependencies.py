from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.product_type.product_type_schema import ProductType as ProductTypeSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.product_type.product_type_repository import ProductTypeRepository
from backend.api_v1.product_type.product_type_service import ProductTypeService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_product_type_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> ProductTypeService:
    return ProductTypeService(
        repository=ProductTypeRepository(session=session),
        user=user,
        session=session,
    )


async def product_type_by_id(
    item_id: int,
    service: ProductTypeService = Depends(get_product_type_service),
) -> ProductTypeSchema:
    return await service.get_by_id(item_id)
