from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.promo_type.promo_type_model import PromoType


class PromoTypeRepository(BaseRepository):
    model = PromoType

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})
