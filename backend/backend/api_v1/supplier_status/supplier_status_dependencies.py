from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.supplier_status.supplier_status_schema import SupplierStatus as SupplierStatusSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.supplier_status.supplier_status_repository import SupplierStatusRepository
from backend.api_v1.supplier_status.supplier_status_service import SupplierStatusService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_supplier_status_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> SupplierStatusService:
    return SupplierStatusService(
        repository=SupplierStatusRepository(session=session),
        user=user,
        session=session,
    )


async def supplier_status_by_id(
    item_id: int,
    service: SupplierStatusService = Depends(get_supplier_status_service),
) -> SupplierStatusSchema:
    return await service.get_by_id(item_id)
