from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.product_status.product_status_model import ProductStatus


class ProductStatusRepository(BaseRepository):
    model = ProductStatus

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})
