from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.tax_rate.tax_rate_model import TaxRate


class TaxRateRepository(BaseRepository):
    model = TaxRate

    async def by_tax_type(self, tax_type_id: int):
        return await self.get_all(filters={"tax_type_id": tax_type_id}, sort="rate")
