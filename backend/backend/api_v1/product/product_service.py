from typing import Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.page import Page
from backend.api_v1.product.product_repository import ProductRepository
from backend.api_v1.product.product_schema import (
    Product as ProductSchema,
    ProductCreate,
    ProductUpdate,
)
from backend.api_v1.product.product_errors import (
    ProductNotFound,
    ProductCodeTaken,
    ProductDeleteError,
)
from backend.api_v1.product.product_success import (
    ProductCreateSuccess,
    ProductUpdateSuccess,
    ProductDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class ProductService(BaseService):
    def __init__(self, repository: ProductRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    def _to_schema(self, row) -> ProductSchema:
        s = ProductSchema.model_validate(row)
        nom = row.nomenclature
        s.market_name = nom.market.name if nom and nom.market else None
        s.segment_name = nom.segment.name if nom and nom.segment else None
        s.category_name = nom.category.name if nom and nom.category else None
        s.family_name = nom.family.name if nom and nom.family else None
        s.status_name = row.status.name if row.status else None
        s.import_code = row.import_code_ref.code if row.import_code_ref else None
        s.import_code_description = row.import_code_ref.description if row.import_code_ref else None
        return s

    async def get_by_id(self, id: int) -> ProductSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(ProductNotFound(id))
        return self._to_schema(row)

    async def list_products(self, *, q: Optional[str] = None, market_id: Optional[int] = None,
                            segment_id: Optional[int] = None, category_id: Optional[int] = None,
                            family_id: Optional[int] = None, nomenclature_id: Optional[int] = None,
                            status_id: Optional[int] = None, import_code_id: Optional[int] = None,
                            supplier_id: Optional[int] = None, page: int = 0, page_size: int = 25,
                            sort: Optional[str] = None, order: str = "asc") -> Page[ProductSchema]:
        rows, total = await self.repository.list_paged(
            q=q, market_id=market_id, segment_id=segment_id, category_id=category_id,
            family_id=family_id, nomenclature_id=nomenclature_id, status_id=status_id,
            import_code_id=import_code_id, supplier_id=supplier_id,
            page=page, page_size=page_size, sort=sort, order=order,
        )
        return Page[ProductSchema](items=[self._to_schema(r) for r in rows], total=total)

    async def _ensure_code_free(self, code: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_code(code):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(ProductCodeTaken(code))

    # -- write -----------------------------------------------------------
    async def create_product(self, body: ProductCreate) -> MutationResponse[ProductSchema]:
        await self._ensure_code_free(body.code)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(ProductCodeTaken(body.code))
            raise
        detail = await self._resolve_domain_success(ProductCreateSuccess(body.code))
        return MutationResponse(detail=detail, data=self._to_schema(await self.repository.get_by_id(created.id)))

    async def update_product(self, id: int, body: ProductUpdate) -> MutationResponse[ProductSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(ProductNotFound(id))
        if body.code:
            await self._ensure_code_free(body.code, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(ProductCodeTaken(body.code or ""))
            raise
        detail = await self._resolve_domain_success(ProductUpdateSuccess(updated.code))
        return MutationResponse(detail=detail, data=self._to_schema(await self.repository.get_by_id(updated.id)))

    async def delete_product(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(ProductNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.code,
            delete_error_exc=ProductDeleteError,
            delete_success_exc=ProductDeleteSuccess,
        )
        detail = await self._resolve_domain_success(ProductDeleteSuccess(obj.code))
        return MutationResponse(detail=detail, data=None)
