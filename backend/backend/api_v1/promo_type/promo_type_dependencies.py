from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.promo_type.promo_type_schema import PromoType as PromoTypeSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.promo_type.promo_type_repository import PromoTypeRepository
from backend.api_v1.promo_type.promo_type_service import PromoTypeService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_promo_type_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> PromoTypeService:
    return PromoTypeService(
        repository=PromoTypeRepository(session=session),
        user=user,
        session=session,
    )


async def promo_type_by_id(
    item_id: int,
    service: PromoTypeService = Depends(get_promo_type_service),
) -> PromoTypeSchema:
    return await service.get_by_id(item_id)
