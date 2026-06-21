from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.category.category_model import Category


class CategoryRepository(BaseRepository):
    model = Category

    async def by_parent(self, segment_id: int):
        return await self.get_all(filters={"segment_id": segment_id}, sort="name")
