from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.supplier.supplier_schema import Supplier as SupplierSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.supplier.supplier_repository import SupplierRepository
from backend.api_v1.supplier.supplier_service import SupplierService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_supplier_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> SupplierService:
    return SupplierService(
        repository=SupplierRepository(session=session),
        user=user,
        session=session,
    )


async def supplier_by_id(
    item_id: int,
    service: SupplierService = Depends(get_supplier_service),
) -> SupplierSchema:
    return await service.get_by_id(item_id)
