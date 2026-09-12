from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.tax_type.tax_type_repository import TaxTypeRepository
from backend.api_v1.tax_type.tax_type_schema import (
    TaxType as TaxTypeSchema,
    TaxTypeCreate,
    TaxTypeUpdate,
)
from backend.api_v1.tax_type.tax_type_errors import (
    TaxTypeNotFound,
    TaxTypeCodeTaken,
    TaxTypeDeleteError,
)
from backend.api_v1.tax_type.tax_type_success import (
    TaxTypeCreateSuccess,
    TaxTypeUpdateSuccess,
    TaxTypeDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class TaxTypeService(BaseService):
    def __init__(self, repository: TaxTypeRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    async def get_by_id(self, id: int) -> TaxTypeSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(TaxTypeNotFound(id))
        return TaxTypeSchema.model_validate(row)

    async def list_tax_types(self, sort: Optional[str] = None) -> List[TaxTypeSchema]:
        rows = await self.get_all(sort_json=sort)
        return [TaxTypeSchema.model_validate(r) for r in rows]

    async def _ensure_code_free(self, code: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_code(code):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(TaxTypeCodeTaken(code))

    async def create_tax_type(self, body: TaxTypeCreate) -> MutationResponse[TaxTypeSchema]:
        await self._ensure_code_free(body.code)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(TaxTypeCodeTaken(body.code))
            raise
        detail = await self._resolve_domain_success(TaxTypeCreateSuccess(body.code))
        return MutationResponse(detail=detail, data=TaxTypeSchema.model_validate(created))

    async def update_tax_type(self, id: int, body: TaxTypeUpdate) -> MutationResponse[TaxTypeSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(TaxTypeNotFound(id))
        if body.code:
            await self._ensure_code_free(body.code, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(TaxTypeCodeTaken(body.code or ""))
            raise
        detail = await self._resolve_domain_success(TaxTypeUpdateSuccess(updated.code))
        return MutationResponse(detail=detail, data=TaxTypeSchema.model_validate(updated))

    async def delete_tax_type(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(TaxTypeNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.code,
            delete_error_exc=TaxTypeDeleteError,
            delete_success_exc=TaxTypeDeleteSuccess,
        )
        detail = await self._resolve_domain_success(TaxTypeDeleteSuccess(obj.code))
        return MutationResponse(detail=detail, data=None)
