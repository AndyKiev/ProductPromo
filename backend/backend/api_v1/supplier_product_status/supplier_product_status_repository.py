from pp_common.crud import BaseRepository
from backend.api_v1.supplier_product_status.supplier_product_status_model import SupplierProductStatus


class SupplierProductStatusRepository(BaseRepository):
    model = SupplierProductStatus

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})
