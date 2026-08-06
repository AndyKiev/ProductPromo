from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.nomenclature_key.nomenclature_key_model import NomenclatureKey


class NomenclatureKeyRepository(BaseRepository):
    model = NomenclatureKey

    async def search(self, q: str, limit: int = 20):
        return await super().search(q=q, limit=limit, search_cols=("name",))
