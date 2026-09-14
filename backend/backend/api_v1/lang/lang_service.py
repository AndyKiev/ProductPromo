from backend.api_v1.base.base_service import BaseService
from backend.api_v1.lang.lang_schema import LangRead


class LangService(BaseService):
    async def list_languages(self) -> list[LangRead]:
        return [LangRead.model_validate(row) for row in await self.repository.get_all(sort="short_name")]
