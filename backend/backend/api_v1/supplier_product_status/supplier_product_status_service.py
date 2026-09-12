from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.supplier_product_status.supplier_product_status_repository import SupplierProductStatusRepository
from backend.api_v1.supplier_product_status.supplier_product_status_schema import (
    SupplierProductStatus as SupplierProductStatusSchema,
    SupplierProductStatusCreate,
    SupplierProductStatusUpdate,
)
from backend.api_v1.supplier_product_status.supplier_product_status_errors import (
    SupplierProductStatusNotFound,
    SupplierProductStatusCodeTaken,
    SupplierProductStatusDeleteError,
)
from backend.api_v1.supplier_product_status.supplier_product_status_success import (
    SupplierProductStatusCreateSuccess,
    SupplierProductStatusUpdateSuccess,
    SupplierProductStatusDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class SupplierProductStatusService(BaseService):
    def __init__(self, repository: SupplierProductStatusRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> SupplierProductStatusSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(SupplierProductStatusNotFound(id))
        return SupplierProductStatusSchema.model_validate(row)

    async def list_supplier_product_statuses(self, sort: Optional[str] = None) -> List[SupplierProductStatusSchema]:
        rows = await self.get_all(sort_json=sort)
        return [SupplierProductStatusSchema.model_validate(r) for r in rows]

    async def _ensure_code_free(self, code: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_code(code):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(SupplierProductStatusCodeTaken(code))

    # -- write -----------------------------------------------------------
    async def create_supplier_product_status(self, body: SupplierProductStatusCreate) -> MutationResponse[SupplierProductStatusSchema]:
        await self._ensure_code_free(body.code)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(SupplierProductStatusCodeTaken(body.code))
            raise
        detail = await self._resolve_domain_success(SupplierProductStatusCreateSuccess(body.code))
        return MutationResponse(detail=detail, data=SupplierProductStatusSchema.model_validate(created))

    async def update_supplier_product_status(self, id: int, body: SupplierProductStatusUpdate) -> MutationResponse[SupplierProductStatusSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(SupplierProductStatusNotFound(id))
        if body.code:
            await self._ensure_code_free(body.code, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(SupplierProductStatusCodeTaken(body.code or ""))
            raise
        detail = await self._resolve_domain_success(SupplierProductStatusUpdateSuccess(updated.code))
        return MutationResponse(detail=detail, data=SupplierProductStatusSchema.model_validate(updated))

    async def delete_supplier_product_status(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(SupplierProductStatusNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.code,
            delete_error_exc=SupplierProductStatusDeleteError,
            delete_success_exc=SupplierProductStatusDeleteSuccess,
        )
        detail = await self._resolve_domain_success(SupplierProductStatusDeleteSuccess(obj.code))
        return MutationResponse(detail=detail, data=None)
