from pp_common.crud import BaseRepository
from backend.api_v1.tax_type.tax_type_model import TaxType


class TaxTypeRepository(BaseRepository):
    model = TaxType

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})
