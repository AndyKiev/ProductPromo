from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.promo_subtype.promo_subtype_schema import PromoSubtype as PromoSubtypeSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.promo_subtype.promo_subtype_repository import PromoSubtypeRepository
from backend.api_v1.promo_subtype.promo_subtype_service import PromoSubtypeService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_promo_subtype_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> PromoSubtypeService:
    return PromoSubtypeService(
        repository=PromoSubtypeRepository(session=session),
        user=user,
        session=session,
    )


async def promo_subtype_by_id(
    item_id: int,
    service: PromoSubtypeService = Depends(get_promo_subtype_service),
) -> PromoSubtypeSchema:
    return await service.get_by_id(item_id)
