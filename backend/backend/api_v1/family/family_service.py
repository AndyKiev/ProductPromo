from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.i18n import lang_suffix_for, localized_name
from backend.api_v1.family.family_repository import FamilyRepository
from backend.api_v1.family.family_schema import Family as FamilySchema, FamilyCreate, FamilyUpdate
from backend.api_v1.family.family_errors import FamilyNotFound, FamilyNameTaken, FamilyDeleteError
from backend.api_v1.family.family_success import (
    FamilyCreateSuccess,
    FamilyUpdateSuccess,
    FamilyDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class FamilyService(BaseService):
    def __init__(self, repository: FamilyRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> FamilySchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(FamilyNotFound(id))
        return self._to_schema(row)

    async def list_family(self, category_id: Optional[int] = None, sort: Optional[str] = None) -> List[FamilySchema]:
        if category_id is not None:
            rows = await self.repository.by_parent(category_id)
        else:
            rows = await self.get_all(sort_json=sort)
        return [self._to_schema(r) for r in rows]

    def _to_schema(self, row) -> FamilySchema:
        s = FamilySchema.model_validate(row)
        suffix = lang_suffix_for(self.user)
        s.status_name = localized_name(row.status, suffix)
        s.category_name = row.category.name if row.category else None
        return s

    # -- write -----------------------------------------------------------
    async def create_family(self, body: FamilyCreate) -> MutationResponse[FamilySchema]:
        await self.exists_by_name(body.name, already_exists_exc=FamilyNameTaken)
        try:
            created = await self.create(body)
            schema = self._to_schema(await self.repository.get_by_id(created.id))
            detail = await self._resolve_domain_success(FamilyCreateSuccess(body.name))
            return MutationResponse(detail=detail, data=schema)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(FamilyNameTaken(body.name))
            raise

    async def update_family(self, id: int, body: FamilyUpdate) -> MutationResponse[FamilySchema]:
        if body.name:
            await self.exists_by_name(body.name, already_exists_exc=FamilyNameTaken, exclude_id=id)
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(FamilyNotFound(id))
        try:
            updated = await self.update(orm, body, partial=True)
            schema = self._to_schema(await self.repository.get_by_id(updated.id))
            detail = await self._resolve_domain_success(FamilyUpdateSuccess(schema.name))
            return MutationResponse(detail=detail, data=schema)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(FamilyNameTaken(body.name))
            raise

    async def delete_family(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(FamilyNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.name,
            delete_error_exc=FamilyDeleteError,
            delete_success_exc=FamilyDeleteSuccess,
        )
        detail = await self._resolve_domain_success(FamilyDeleteSuccess(obj.name))
        return MutationResponse(detail=detail, data=None)