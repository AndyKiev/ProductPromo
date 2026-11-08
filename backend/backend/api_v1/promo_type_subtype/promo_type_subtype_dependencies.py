from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.promo_type_subtype.promo_type_subtype_schema import PromoTypeSubtype as PromoTypeSubtypeSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.promo_type_subtype.promo_type_subtype_repository import PromoTypeSubtypeRepository
from backend.api_v1.promo_type_subtype.promo_type_subtype_service import PromoTypeSubtypeService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_promo_type_subtype_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> PromoTypeSubtypeService:
    return PromoTypeSubtypeService(
        repository=PromoTypeSubtypeRepository(session=session),
        user=user,
        session=session,
    )


async def promo_type_subtype_by_id(
    item_id: int,
    service: PromoTypeSubtypeService = Depends(get_promo_type_subtype_service),
) -> PromoTypeSubtypeSchema:
    return await service.get_by_id(item_id)
