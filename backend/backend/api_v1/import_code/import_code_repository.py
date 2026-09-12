from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.import_code.import_code_model import ImportCode


class ImportCodeRepository(BaseRepository):
    model = ImportCode

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})
