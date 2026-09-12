from typing import Optional

from sqlalchemy import select, func, or_, asc, desc, cast, Integer
from sqlalchemy.orm import contains_eager

from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.product.product_model import Product
from backend.api_v1.product_status.product_status_model import ProductStatus
from backend.api_v1.nomenclature.nomenclature_model import Nomenclature
from backend.api_v1.product_supplier.product_supplier_model import ProductSupplier
from backend.api_v1.ean.ean_model import Ean

_SORTABLE = {
    "id", "code", "name", "status", "status_id",
    "import_code_id", "nomenclature_id", "product_type_id",
}


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
        product_type_id: Optional[int] = None,
        supplier_id: Optional[int] = None,
        ean: Optional[str] = None,
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
        if product_type_id is not None:
            stmt = stmt.where(Product.product_type_id == product_type_id)
        if ean:
            stmt = stmt.where(Product.id.in_(
                select(Ean.product_id).where(Ean.ean.ilike(f"%{ean}%"))
            ))
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

        sort_field = sort if sort in _SORTABLE else "id"
        if sort_field == "code":
            # `code` is stored as text but is numeric: order it numerically.
            column = cast(Product.code, Integer)
        elif sort_field == "status":
            stmt = stmt.join(ProductStatus, Product.status_id == ProductStatus.id).options(
                contains_eager(Product.status)
            )
            column = func.coalesce(ProductStatus.name, ProductStatus.code)
        else:
            column = getattr(Product, sort_field)
        stmt = stmt.order_by(desc(column) if order == "desc" else asc(column))
        stmt = stmt.limit(page_size).offset(page * page_size)
        rows = (await self.session.execute(stmt)).scalars().unique().all()
        return rows, total
