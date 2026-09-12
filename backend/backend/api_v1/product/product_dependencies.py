from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.product.product_schema import Product as ProductSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.product.product_repository import ProductRepository
from backend.api_v1.product.product_service import ProductService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_product_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> ProductService:
    return ProductService(
        repository=ProductRepository(session=session),
        user=user,
        session=session,
    )


async def product_by_id(
    item_id: int,
    service: ProductService = Depends(get_product_service),
) -> ProductSchema:
    return await service.get_by_id(item_id)
