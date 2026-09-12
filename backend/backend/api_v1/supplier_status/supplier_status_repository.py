from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.supplier_status.supplier_status_model import SupplierStatus


class SupplierStatusRepository(BaseRepository):
    model = SupplierStatus

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})
