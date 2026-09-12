from typing import Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.page import Page
from backend.api_v1.supplier.supplier_repository import SupplierRepository
from backend.api_v1.supplier.supplier_schema import (
    Supplier as SupplierSchema,
    SupplierCreate,
    SupplierUpdate,
)
from backend.api_v1.supplier.supplier_errors import (
    SupplierNotFound,
    SupplierCodeTaken,
    SupplierDeleteError,
)
from backend.api_v1.supplier.supplier_success import (
    SupplierCreateSuccess,
    SupplierUpdateSuccess,
    SupplierDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class SupplierService(BaseService):
    def __init__(self, repository: SupplierRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    def _to_schema(self, row) -> SupplierSchema:
        s = SupplierSchema.model_validate(row)
        s.status_name = row.status.name if row.status else None
        return s

    async def get_by_id(self, id: int) -> SupplierSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(SupplierNotFound(id))
        return self._to_schema(row)

    async def list_suppliers(self, *, q: Optional[str] = None, status_id: Optional[int] = None,
                             page: int = 0, page_size: int = 25,
                             sort: Optional[str] = None, order: str = "asc") -> Page[SupplierSchema]:
        rows, total = await self.repository.list_paged(
            q=q, status_id=status_id, page=page, page_size=page_size, sort=sort, order=order,
        )
        return Page[SupplierSchema](items=[self._to_schema(r) for r in rows], total=total)

    async def _ensure_code_free(self, code: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_code(code):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(SupplierCodeTaken(code))

    # -- write -----------------------------------------------------------
    async def create_supplier(self, body: SupplierCreate) -> MutationResponse[SupplierSchema]:
        await self._ensure_code_free(body.code)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(SupplierCodeTaken(body.code))
            raise
        detail = await self._resolve_domain_success(SupplierCreateSuccess(body.code))
        return MutationResponse(detail=detail, data=self._to_schema(await self.repository.get_by_id(created.id)))

    async def update_supplier(self, id: int, body: SupplierUpdate) -> MutationResponse[SupplierSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(SupplierNotFound(id))
        if body.code:
            await self._ensure_code_free(body.code, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(SupplierCodeTaken(body.code or ""))
            raise
        detail = await self._resolve_domain_success(SupplierUpdateSuccess(updated.code))
        return MutationResponse(detail=detail, data=self._to_schema(await self.repository.get_by_id(updated.id)))

    async def delete_supplier(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(SupplierNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.code,
            delete_error_exc=SupplierDeleteError,
            delete_success_exc=SupplierDeleteSuccess,
        )
        detail = await self._resolve_domain_success(SupplierDeleteSuccess(obj.code))
        return MutationResponse(detail=detail, data=None)
