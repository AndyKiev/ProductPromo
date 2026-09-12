from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.page import Page
from backend.api_v1.product_supplier.product_supplier_repository import ProductSupplierRepository
from backend.api_v1.product_supplier.product_supplier_schema import (
    ProductSupplier as ProductSupplierSchema,
    ProductSupplierUpdate,
)
from backend.api_v1.product_supplier.product_supplier_errors import (
    ProductSupplierNotFound,
    ProductSupplierDeleteError,
)
from backend.api_v1.product_supplier.product_supplier_success import (
    ProductSupplierUpdateSuccess,
    ProductSupplierDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class ProductSupplierService(BaseService):
    def __init__(self, repository: ProductSupplierRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    def _to_schema(self, row) -> ProductSupplierSchema:
        s = ProductSupplierSchema.model_validate(row)
        s.product_code = row.product.code if row.product else None
        s.product_name = row.product.name if row.product else None
        s.supplier_code = row.supplier.code if row.supplier else None
        s.supplier_name = row.supplier.name if row.supplier else None
        s.status_name = (row.status.name or row.status.code) if row.status else None
        return s

    async def get_by_id(self, id: int) -> ProductSupplierSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(ProductSupplierNotFound(id))
        return self._to_schema(row)

    async def list_links(self, *, q: Optional[str] = None, product_id: Optional[int] = None,
                         supplier_id: Optional[int] = None, status_id: Optional[int] = None,
                         page: int = 0, page_size: int = 25,
                         sort: Optional[str] = None, order: str = "asc") -> Page[ProductSupplierSchema]:
        rows, total = await self.repository.list_paged(
            q=q, product_id=product_id, supplier_id=supplier_id, status_id=status_id,
            page=page, page_size=page_size, sort=sort, order=order,
        )
        return Page[ProductSupplierSchema](items=[self._to_schema(r) for r in rows], total=total)

    # -- write -----------------------------------------------------------
    async def update_link(self, id: int, body: ProductSupplierUpdate) -> MutationResponse[ProductSupplierSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(ProductSupplierNotFound(id))
        updated = await self.update(orm, body, partial=True)
        detail = await self._resolve_domain_success(ProductSupplierUpdateSuccess(str(updated.id)))
        return MutationResponse(detail=detail, data=self._to_schema(await self.repository.get_by_id(updated.id)))

    async def delete_link(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(ProductSupplierNotFound(id))
        await self.delete_by_id(
            id,
            name=str(id),
            delete_error_exc=ProductSupplierDeleteError,
            delete_success_exc=ProductSupplierDeleteSuccess,
        )
        detail = await self._resolve_domain_success(ProductSupplierDeleteSuccess(str(id)))
        return MutationResponse(detail=detail, data=None)
