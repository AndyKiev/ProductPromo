from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database.db_helper import db_helper
from backend.api_v1.lang.lang_repository import LangRepository
from backend.api_v1.lang.lang_service import LangService


async def get_lang_service(session: AsyncSession = Depends(db_helper.session_getter)) -> LangService:
    return LangService(LangRepository(session), session=session)
