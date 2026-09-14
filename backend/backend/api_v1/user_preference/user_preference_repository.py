from sqlalchemy.dialects.postgresql import insert
from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.user_preference.user_preference_model import UserPreference


class UserPreferenceRepository(BaseRepository):
    model = UserPreference

    async def set_language(self, code: str, lang_id: int) -> None:
        stmt = insert(UserPreference).values(code=code, lang_id=lang_id)
        await self.session.execute(stmt.on_conflict_do_update(
            index_elements=[UserPreference.code], set_={"LangId": lang_id},
        ))
        await self.session.commit()
