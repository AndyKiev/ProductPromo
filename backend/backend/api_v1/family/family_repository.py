from typing import Optional

from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.family.family_model import Family


class FamilyRepository(BaseRepository):
    model = Family

    async def by_parent(self, category_id: int):
        return await self.get_all(filters={"category_id": category_id}, sort="name")

    async def search(self, q: str, category_id: Optional[int] = None, limit: int = 20):
        filters = {"category_id": category_id} if category_id is not None else None
        return await super().search(q=q, filters=filters, limit=limit, search_cols=("name", "code"))
