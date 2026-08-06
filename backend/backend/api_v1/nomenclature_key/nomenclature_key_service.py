from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.i18n import lang_suffix_for, localized_name
from backend.api_v1.nomenclature_key.nomenclature_key_repository import NomenclatureKeyRepository
from backend.api_v1.nomenclature_key.nomenclature_key_schema import NomenclatureKey as NomenclatureKeySchema, NomenclatureKeyCreate, NomenclatureKeyUpdate
from backend.api_v1.nomenclature_key.nomenclature_key_errors import NomenclatureKeyNotFound, NomenclatureKeyNameTaken, NomenclatureKeyDeleteError
from backend.api_v1.nomenclature_key.nomenclature_key_success import (
    NomenclatureKeyCreateSuccess,
    NomenclatureKeyUpdateSuccess,
    NomenclatureKeyDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class NomenclatureKeyService(BaseService):
    def __init__(self, repository: NomenclatureKeyRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> NomenclatureKeySchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(NomenclatureKeyNotFound(id))
        return self._to_schema(row)

    async def list_nomenclature_key(
        self,
        sort: Optional[str] = None,
        q: Optional[str] = None,
        limit: int = 20,
    ) -> List[NomenclatureKeySchema]:
        if q:
            rows = await self.repository.search(q=q, limit=limit)
        else:
            rows = await self.get_all(sort_json=sort)
        return [self._to_schema(r) for r in rows]

    def _to_schema(self, row) -> NomenclatureKeySchema:
        s = NomenclatureKeySchema.model_validate(row)
        pass
        return s

    # -- write -----------------------------------------------------------
    async def create_nomenclature_key(self, body: NomenclatureKeyCreate) -> MutationResponse[NomenclatureKeySchema]:
        await self.exists_by_name(body.name, already_exists_exc=NomenclatureKeyNameTaken)
        try:
            created = await self.create(body)
            schema = self._to_schema(await self.repository.get_by_id(created.id))
            detail = await self._resolve_domain_success(NomenclatureKeyCreateSuccess(body.name))
            return MutationResponse(detail=detail, data=schema)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(NomenclatureKeyNameTaken(body.name))
            raise

    async def update_nomenclature_key(self, id: int, body: NomenclatureKeyUpdate) -> MutationResponse[NomenclatureKeySchema]:
        if body.name:
            await self.exists_by_name(body.name, already_exists_exc=NomenclatureKeyNameTaken)
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(NomenclatureKeyNotFound(id))
        try:
            updated = await self.update(orm, body, partial=True)
            schema = self._to_schema(await self.repository.get_by_id(updated.id))
            detail = await self._resolve_domain_success(NomenclatureKeyUpdateSuccess(schema.name))
            return MutationResponse(detail=detail, data=schema)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(NomenclatureKeyNameTaken(body.name))
            raise

    async def delete_nomenclature_key(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(NomenclatureKeyNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.name,
            delete_error_exc=NomenclatureKeyDeleteError,
            delete_success_exc=NomenclatureKeyDeleteSuccess,
        )
        detail = await self._resolve_domain_success(NomenclatureKeyDeleteSuccess(obj.name))
        return MutationResponse(detail=detail, data=None)