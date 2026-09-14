from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.supplier_status.supplier_status_repository import SupplierStatusRepository
from backend.api_v1.supplier_status.supplier_status_schema import (
    SupplierStatus as SupplierStatusSchema,
    SupplierStatusCreate,
    SupplierStatusUpdate,
)
from backend.api_v1.supplier_status.supplier_status_errors import (
    SupplierStatusNotFound,
    SupplierStatusCodeTaken,
    SupplierStatusDeleteError,
)
from backend.api_v1.supplier_status.supplier_status_success import (
    SupplierStatusCreateSuccess,
    SupplierStatusUpdateSuccess,
    SupplierStatusDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class SupplierStatusService(BaseService):
    def __init__(self, repository: SupplierStatusRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> SupplierStatusSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(SupplierStatusNotFound(id))
        return SupplierStatusSchema.model_validate(row)

    async def list_supplier_statuses(self, sort: Optional[str] = None) -> List[SupplierStatusSchema]:
        rows = await self.get_all(sort_json=sort)
        return [SupplierStatusSchema.model_validate(r) for r in rows]

    async def _ensure_code_free(self, code: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_code(code):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(SupplierStatusCodeTaken(code))

    # -- write -----------------------------------------------------------
    async def create_supplier_status(self, body: SupplierStatusCreate) -> MutationResponse[SupplierStatusSchema]:
        await self._ensure_code_free(body.code)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(SupplierStatusCodeTaken(body.code))
            raise
        detail = await self._resolve_domain_success(SupplierStatusCreateSuccess(body.code))
        return MutationResponse(**detail, data=SupplierStatusSchema.model_validate(created))

    async def update_supplier_status(self, id: int, body: SupplierStatusUpdate) -> MutationResponse[SupplierStatusSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(SupplierStatusNotFound(id))
        if body.code:
            await self._ensure_code_free(body.code, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(SupplierStatusCodeTaken(body.code or ""))
            raise
        detail = await self._resolve_domain_success(SupplierStatusUpdateSuccess(updated.code))
        return MutationResponse(**detail, data=SupplierStatusSchema.model_validate(updated))

    async def delete_supplier_status(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(SupplierStatusNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.code,
            delete_error_exc=SupplierStatusDeleteError,
            delete_success_exc=SupplierStatusDeleteSuccess,
        )
        detail = await self._resolve_domain_success(SupplierStatusDeleteSuccess(obj.code))
        return MutationResponse(**detail, data=None)
