from typing import Optional

from sqlalchemy import select

from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.ean.ean_model import Ean


class EanRepository(BaseRepository):
    model = Ean

    async def list_by_product(self, product_id: int, q: Optional[str] = None):
        stmt = select(Ean).where(Ean.product_id == product_id)
        if q:
            stmt = stmt.where(Ean.ean.ilike(f"%{q}%"))
        stmt = stmt.order_by(Ean.ean)
        return (await self.session.execute(stmt)).scalars().all()

    async def by_ean(self, ean: str):
        return await self.get_all(filters={"ean": ean})
