from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.product_tax.product_tax_schema import ProductTax as ProductTaxSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.product_tax.product_tax_repository import ProductTaxRepository
from backend.api_v1.product_tax.product_tax_service import ProductTaxService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_product_tax_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> ProductTaxService:
    return ProductTaxService(
        repository=ProductTaxRepository(session=session),
        user=user,
        session=session,
    )


async def product_tax_by_id(
    item_id: int,
    service: ProductTaxService = Depends(get_product_tax_service),
) -> ProductTaxSchema:
    return await service.get_by_id(item_id)
