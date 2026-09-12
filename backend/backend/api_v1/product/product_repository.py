from typing import Optional

from sqlalchemy import select, func, or_, asc, desc

from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.product.product_model import Product
from backend.api_v1.nomenclature.nomenclature_model import Nomenclature
from backend.api_v1.product_supplier.product_supplier_model import ProductSupplier

_SORTABLE = {"id", "code", "name", "status_id", "import_code_id", "nomenclature_id"}


class ProductRepository(BaseRepository):
    model = Product

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})

    async def list_paged(
        self,
        *,
        q: Optional[str] = None,
        market_id: Optional[int] = None,
        segment_id: Optional[int] = None,
        category_id: Optional[int] = None,
        family_id: Optional[int] = None,
        nomenclature_id: Optional[int] = None,
        status_id: Optional[int] = None,
        import_code_id: Optional[int] = None,
        supplier_id: Optional[int] = None,
        page: int = 0,
        page_size: int = 25,
        sort: Optional[str] = None,
        order: str = "asc",
    ):
        stmt = select(Product)
        if q:
            like = f"%{q}%"
            stmt = stmt.where(or_(Product.code.ilike(like), Product.name.ilike(like)))
        if nomenclature_id is not None:
            stmt = stmt.where(Product.nomenclature_id == nomenclature_id)
        if status_id is not None:
            stmt = stmt.where(Product.status_id == status_id)
        if import_code_id is not None:
            stmt = stmt.where(Product.import_code_id == import_code_id)
        if any(v is not None for v in (market_id, segment_id, category_id, family_id)):
            stmt = stmt.join(Nomenclature, Product.nomenclature_id == Nomenclature.id)
            if market_id is not None:
                stmt = stmt.where(Nomenclature.market_id == market_id)
            if segment_id is not None:
                stmt = stmt.where(Nomenclature.segment_id == segment_id)
            if category_id is not None:
                stmt = stmt.where(Nomenclature.category_id == category_id)
            if family_id is not None:
                stmt = stmt.where(Nomenclature.family_id == family_id)
        if supplier_id is not None:
            stmt = stmt.where(Product.id.in_(
                select(ProductSupplier.product_id).where(ProductSupplier.supplier_id == supplier_id)
            ))

        total = (await self.session.execute(
            select(func.count()).select_from(stmt.subquery())
        )).scalar_one()

        column = getattr(Product, sort if sort in _SORTABLE else "id")
        stmt = stmt.order_by(desc(column) if order == "desc" else asc(column))
        stmt = stmt.limit(page_size).offset(page * page_size)
        rows = (await self.session.execute(stmt)).scalars().unique().all()
        return rows, total
