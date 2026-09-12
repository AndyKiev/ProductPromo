from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.product_type.product_type_model import ProductType


class ProductTypeRepository(BaseRepository):
    model = ProductType

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})
