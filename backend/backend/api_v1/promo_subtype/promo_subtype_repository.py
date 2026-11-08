from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.promo_subtype.promo_subtype_model import PromoSubtype


class PromoSubtypeRepository(BaseRepository):
    model = PromoSubtype

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})
