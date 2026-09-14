from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.import_code.import_code_repository import ImportCodeRepository
from backend.api_v1.import_code.import_code_schema import (
    ImportCode as ImportCodeSchema,
    ImportCodeCreate,
    ImportCodeUpdate,
)
from backend.api_v1.import_code.import_code_errors import (
    ImportCodeNotFound,
    ImportCodeTaken,
    ImportCodeDeleteError,
)
from backend.api_v1.import_code.import_code_success import (
    ImportCodeCreateSuccess,
    ImportCodeUpdateSuccess,
    ImportCodeDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class ImportCodeService(BaseService):
    def __init__(self, repository: ImportCodeRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> ImportCodeSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(ImportCodeNotFound(id))
        return ImportCodeSchema.model_validate(row)

    async def list_import_codes(self, sort: Optional[str] = None) -> List[ImportCodeSchema]:
        rows = await self.get_all(sort_json=sort)
        return [ImportCodeSchema.model_validate(r) for r in rows]

    async def _ensure_code_free(self, code: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_code(code):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(ImportCodeTaken(code))

    # -- write -----------------------------------------------------------
    async def create_import_code(self, body: ImportCodeCreate) -> MutationResponse[ImportCodeSchema]:
        await self._ensure_code_free(body.code)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(ImportCodeTaken(body.code))
            raise
        detail = await self._resolve_domain_success(ImportCodeCreateSuccess(body.code))
        return MutationResponse(**detail, data=ImportCodeSchema.model_validate(created))

    async def update_import_code(self, id: int, body: ImportCodeUpdate) -> MutationResponse[ImportCodeSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(ImportCodeNotFound(id))
        if body.code:
            await self._ensure_code_free(body.code, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(ImportCodeTaken(body.code or ""))
            raise
        detail = await self._resolve_domain_success(ImportCodeUpdateSuccess(updated.code))
        return MutationResponse(**detail, data=ImportCodeSchema.model_validate(updated))

    async def delete_import_code(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(ImportCodeNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.code,
            delete_error_exc=ImportCodeDeleteError,
            delete_success_exc=ImportCodeDeleteSuccess,
        )
        detail = await self._resolve_domain_success(ImportCodeDeleteSuccess(obj.code))
        return MutationResponse(**detail, data=None)
