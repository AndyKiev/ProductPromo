from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.promo_type_subtype.promo_type_subtype_model import PromoTypeSubtype


class PromoTypeSubtypeRepository(BaseRepository):
    model = PromoTypeSubtype

    async def by_pair(self, promo_type_id: int, promo_subtype_id: int):
        return await self.get_all(filters={"promo_type_id": promo_type_id, "promo_subtype_id": promo_subtype_id})
