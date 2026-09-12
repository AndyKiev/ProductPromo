from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.page import Page
from backend.api_v1.product_tax.product_tax_repository import ProductTaxRepository
from backend.api_v1.product_tax.product_tax_schema import (
    ProductTax as ProductTaxSchema,
    ProductTaxUpdate,
)
from backend.api_v1.product_tax.product_tax_errors import ProductTaxNotFound, ProductTaxDeleteError
from backend.api_v1.product_tax.product_tax_success import (
    ProductTaxUpdateSuccess,
    ProductTaxDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class ProductTaxService(BaseService):
    def __init__(self, repository: ProductTaxRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    def _to_schema(self, row) -> ProductTaxSchema:
        s = ProductTaxSchema.model_validate(row)
        s.product_code = row.product.code if row.product else None
        s.product_name = row.product.name if row.product else None
        s.tax_type_code = row.tax_type.code if row.tax_type else None
        s.tax_type_name = row.tax_type.name if row.tax_type else None
        s.rate = row.tax_rate.rate if row.tax_rate else None
        return s

    async def get_by_id(self, id: int) -> ProductTaxSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(ProductTaxNotFound(id))
        return self._to_schema(row)

    async def list_product_taxes(self, *, q: Optional[str] = None, product_id: Optional[int] = None,
                                 tax_type_id: Optional[int] = None, page: int = 0, page_size: int = 25,
                                 sort: Optional[str] = None, order: str = "asc") -> Page[ProductTaxSchema]:
        rows, total = await self.repository.list_paged(
            q=q, product_id=product_id, tax_type_id=tax_type_id,
            page=page, page_size=page_size, sort=sort, order=order,
        )
        return Page[ProductTaxSchema](items=[self._to_schema(r) for r in rows], total=total)

    # -- write -----------------------------------------------------------
    async def update_product_tax(self, id: int, body: ProductTaxUpdate) -> MutationResponse[ProductTaxSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(ProductTaxNotFound(id))
        updated = await self.update(orm, body, partial=True)
        schema = self._to_schema(await self.repository.get_by_id(updated.id))
        detail = await self._resolve_domain_success(ProductTaxUpdateSuccess(str(updated.id)))
        return MutationResponse(detail=detail, data=schema)

    async def delete_product_tax(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(ProductTaxNotFound(id))
        await self.delete_by_id(
            id,
            name=str(id),
            delete_error_exc=ProductTaxDeleteError,
            delete_success_exc=ProductTaxDeleteSuccess,
        )
        detail = await self._resolve_domain_success(ProductTaxDeleteSuccess(str(id)))
        return MutationResponse(detail=detail, data=None)
