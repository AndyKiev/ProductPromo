from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.product_supplier.product_supplier_schema import ProductSupplier as ProductSupplierSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.product_supplier.product_supplier_repository import ProductSupplierRepository
from backend.api_v1.product_supplier.product_supplier_service import ProductSupplierService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_product_supplier_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> ProductSupplierService:
    return ProductSupplierService(
        repository=ProductSupplierRepository(session=session),
        user=user,
        session=session,
    )


async def product_supplier_by_id(
    item_id: int,
    service: ProductSupplierService = Depends(get_product_supplier_service),
) -> ProductSupplierSchema:
    return await service.get_by_id(item_id)
