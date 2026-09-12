from typing import Optional

from sqlalchemy import select, func, or_, asc, desc

from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.product_tax.product_tax_model import ProductTax
from backend.api_v1.product.product_model import Product

_SORTABLE = {"id", "product_id", "tax_type_id", "tax_rate_id"}


class ProductTaxRepository(BaseRepository):
    model = ProductTax

    async def list_paged(
        self,
        *,
        q: Optional[str] = None,
        product_id: Optional[int] = None,
        tax_type_id: Optional[int] = None,
        page: int = 0,
        page_size: int = 25,
        sort: Optional[str] = None,
        order: str = "asc",
    ):
        stmt = select(ProductTax)
        if product_id is not None:
            stmt = stmt.where(ProductTax.product_id == product_id)
        if tax_type_id is not None:
            stmt = stmt.where(ProductTax.tax_type_id == tax_type_id)
        if q:
            like = f"%{q}%"
            stmt = stmt.join(Product, ProductTax.product_id == Product.id)
            stmt = stmt.where(or_(Product.code.ilike(like), Product.name.ilike(like)))

        total = (await self.session.execute(
            select(func.count()).select_from(stmt.subquery())
        )).scalar_one()

        column = getattr(ProductTax, sort if sort in _SORTABLE else "id")
        stmt = stmt.order_by(desc(column) if order == "desc" else asc(column))
        stmt = stmt.limit(page_size).offset(page * page_size)
        rows = (await self.session.execute(stmt)).scalars().unique().all()
        return rows, total
