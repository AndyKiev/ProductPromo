from typing import Optional

from sqlalchemy import select, func, or_, asc, desc

from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.product_supplier.product_supplier_model import ProductSupplier
from backend.api_v1.product.product_model import Product
from backend.api_v1.supplier.supplier_model import Supplier

_SORTABLE = {"id", "product_id", "supplier_id", "status_id"}


class ProductSupplierRepository(BaseRepository):
    model = ProductSupplier

    async def list_paged(
        self,
        *,
        q: Optional[str] = None,
        product_id: Optional[int] = None,
        supplier_id: Optional[int] = None,
        status_id: Optional[int] = None,
        page: int = 0,
        page_size: int = 25,
        sort: Optional[str] = None,
        order: str = "asc",
    ):
        stmt = select(ProductSupplier)
        if product_id is not None:
            stmt = stmt.where(ProductSupplier.product_id == product_id)
        if supplier_id is not None:
            stmt = stmt.where(ProductSupplier.supplier_id == supplier_id)
        if status_id is not None:
            stmt = stmt.where(ProductSupplier.status_id == status_id)
        if q:
            like = f"%{q}%"
            stmt = stmt.join(Product, ProductSupplier.product_id == Product.id)
            stmt = stmt.join(Supplier, ProductSupplier.supplier_id == Supplier.id)
            stmt = stmt.where(or_(
                Product.code.ilike(like),
                Product.name.ilike(like),
                Supplier.code.ilike(like),
                Supplier.name.ilike(like),
            ))

        total = (await self.session.execute(
            select(func.count()).select_from(stmt.subquery())
        )).scalar_one()

        column = getattr(ProductSupplier, sort if sort in _SORTABLE else "id")
        stmt = stmt.order_by(desc(column) if order == "desc" else asc(column))
        stmt = stmt.limit(page_size).offset(page * page_size)
        rows = (await self.session.execute(stmt)).scalars().unique().all()
        return rows, total
