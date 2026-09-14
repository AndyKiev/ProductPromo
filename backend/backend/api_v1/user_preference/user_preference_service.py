from backend.api_v1.base.base_service import BaseService
from backend.api_v1.lang.lang_errors import LangNotFound
from backend.api_v1.lang.lang_model import Lang
from backend.api_v1.lang.lang_schema import LangRead
from backend.api_v1.user_preference.user_preference_schema import UserProfile


class UserPreferenceService(BaseService):
    async def profile(self, code: str, default_lang_id: int) -> UserProfile:
        preference = await self.repository.get_by_id(code)
        lang_id = preference.lang_id if preference else default_lang_id
        lang = await self.session.get(Lang, lang_id)
        return UserProfile(code=code, name=code, lang_id=lang.id, lang=LangRead.model_validate(lang))

    async def set_language(self, code: str, lang_id: int) -> UserProfile:
        if await self.session.get(Lang, lang_id) is None:
            raise LangNotFound(lang_id)
        await self.repository.set_language(code, lang_id)
        return await self.profile(code, lang_id)
