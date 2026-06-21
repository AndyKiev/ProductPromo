from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.family.family_model import Family


class FamilyRepository(BaseRepository):
    model = Family

    async def by_parent(self, category_id: int):
        return await self.get_all(filters={"category_id": category_id}, sort="name")
