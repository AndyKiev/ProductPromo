from typing import Optional

from sqlalchemy import select, func, or_, asc, desc

from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.supplier.supplier_model import Supplier

_SORTABLE = {"id", "code", "name", "status_id"}


class SupplierRepository(BaseRepository):
    model = Supplier

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})

    async def list_paged(
        self,
        *,
        q: Optional[str] = None,
        status_id: Optional[int] = None,
        page: int = 0,
        page_size: int = 25,
        sort: Optional[str] = None,
        order: str = "asc",
    ):
        stmt = select(Supplier)
        if q:
            like = f"%{q}%"
            stmt = stmt.where(or_(Supplier.code.ilike(like), Supplier.name.ilike(like)))
        if status_id is not None:
            stmt = stmt.where(Supplier.status_id == status_id)

        total = (await self.session.execute(
            select(func.count()).select_from(stmt.subquery())
        )).scalar_one()

        column = getattr(Supplier, sort if sort in _SORTABLE else "id")
        stmt = stmt.order_by(desc(column) if order == "desc" else asc(column))
        stmt = stmt.limit(page_size).offset(page * page_size)
        rows = (await self.session.execute(stmt)).scalars().unique().all()
        return rows, total
