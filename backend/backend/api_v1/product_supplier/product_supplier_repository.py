from typing import Optional

from sqlalchemy import select, func, or_, asc, desc, cast, Integer
from sqlalchemy.orm import contains_eager

from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.product_supplier.product_supplier_model import ProductSupplier
from backend.api_v1.product.product_model import Product
from backend.api_v1.supplier.supplier_model import Supplier
from backend.api_v1.supplier_product_status.supplier_product_status_model import SupplierProductStatus

_SORTABLE = {"id", "product_id", "supplier_id", "status_id", "product_code", "status"}


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
            # Sub-queries (not joins) so a later sort by `product_code` can add
            # its own join without colliding.
            stmt = stmt.where(or_(
                ProductSupplier.product_id.in_(
                    select(Product.id).where(or_(Product.code.ilike(like), Product.name.ilike(like)))
                ),
                ProductSupplier.supplier_id.in_(
                    select(Supplier.id).where(or_(Supplier.code.ilike(like), Supplier.name.ilike(like)))
                ),
            ))

        total = (await self.session.execute(
            select(func.count()).select_from(stmt.subquery())
        )).scalar_one()

        sort_field = sort if sort in _SORTABLE else "id"
        if sort_field == "product_code":
            # JOIN + contains_eager instead of a correlated sub-query: ordering
            # a million rows by a per-row sub-select never finishes in time.
            stmt = stmt.join(Product, ProductSupplier.product_id == Product.id).options(
                contains_eager(ProductSupplier.product)
            )
            column = cast(Product.code, Integer)
        elif sort_field == "status":
            stmt = stmt.join(SupplierProductStatus, ProductSupplier.status_id == SupplierProductStatus.id).options(
                contains_eager(ProductSupplier.status)
            )
            column = func.coalesce(SupplierProductStatus.name, SupplierProductStatus.code)
        else:
            column = getattr(ProductSupplier, sort_field)
        stmt = stmt.order_by(desc(column) if order == "desc" else asc(column))
        stmt = stmt.limit(page_size).offset(page * page_size)
        rows = (await self.session.execute(stmt)).scalars().unique().all()
        return rows, total
