from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.supplier_product_status.supplier_product_status_schema import (
    SupplierProductStatus as SupplierProductStatusSchema,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.supplier_product_status.supplier_product_status_repository import SupplierProductStatusRepository
from backend.api_v1.supplier_product_status.supplier_product_status_service import SupplierProductStatusService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_supplier_product_status_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> SupplierProductStatusService:
    return SupplierProductStatusService(
        repository=SupplierProductStatusRepository(session=session),
        user=user,
        session=session,
    )


async def supplier_product_status_by_id(
    item_id: int,
    service: SupplierProductStatusService = Depends(get_supplier_product_status_service),
) -> SupplierProductStatusSchema:
    return await service.get_by_id(item_id)
