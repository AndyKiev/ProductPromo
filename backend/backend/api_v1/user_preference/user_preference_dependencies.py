from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database.db_helper import db_helper
from backend.api_v1.user_preference.user_preference_repository import UserPreferenceRepository
from backend.api_v1.user_preference.user_preference_service import UserPreferenceService


async def get_preference_service(session: AsyncSession = Depends(db_helper.session_getter)) -> UserPreferenceService:
    return UserPreferenceService(UserPreferenceRepository(session), session=session)
