from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from backend.api_v1.nomenclature_key_link.key_link_schema import KeyLink as KeyLinkSchema
from backend.api_v1.nomenclature_key_link.key_link_repository import KeyLink1Repository
from backend.api_v1.nomenclature_key_link.key_link2_repository import KeyLink2Repository
from backend.api_v1.nomenclature_key_link.key_link3_repository import KeyLink3Repository
from backend.api_v1.nomenclature_key_link.key_link_service import KeyLinkService
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_key_link1_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> KeyLinkService:
    return KeyLinkService(repository=KeyLink1Repository(session=session), level=1, user=user, session=session)


async def get_key_link2_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> KeyLinkService:
    return KeyLinkService(repository=KeyLink2Repository(session=session), level=2, user=user, session=session)


async def get_key_link3_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> KeyLinkService:
    return KeyLinkService(repository=KeyLink3Repository(session=session), level=3, user=user, session=session)


async def key_link1_by_id(
    item_id: int,
    service: KeyLinkService = Depends(get_key_link1_service),
) -> KeyLinkSchema:
    return await service.get_by_id(item_id)


async def key_link2_by_id(
    item_id: int,
    service: KeyLinkService = Depends(get_key_link2_service),
) -> KeyLinkSchema:
    return await service.get_by_id(item_id)


async def key_link3_by_id(
    item_id: int,
    service: KeyLinkService = Depends(get_key_link3_service),
) -> KeyLinkSchema:
    return await service.get_by_id(item_id)
