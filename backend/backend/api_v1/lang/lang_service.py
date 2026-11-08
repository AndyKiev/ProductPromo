from pp_common.crud import BaseService
from pp_common.i18n import LangRead


class LangService(BaseService):
    async def list_languages(self) -> list[LangRead]:
        return [LangRead.model_validate(row) for row in await self.repository.get_all(sort="short_name")]
