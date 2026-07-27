from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.market.market_schema import Market as MarketSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.market.market_repository import MarketRepository
from backend.api_v1.market.market_service import MarketService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_market_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> MarketService:
    return MarketService(
        repository=MarketRepository(session=session),
        user=user,
        session=session,
    )


async def market_by_id(
    item_id: int,
    service: MarketService = Depends(get_market_service),
) -> MarketSchema:
    return await service.get_by_id(item_id)
