from typing import List, Optional, Type
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.nomenclature_key_link.key_link_schema import KeyLinkCreate, KeyLinkUpdate, KeyLink as KeyLinkSchema
from backend.api_v1.nomenclature_key_link.key_link_errors import KeyLinkNotFound, KeyLinkDeleteError
from backend.api_v1.nomenclature_key_link.key_link_success import (
    KeyLinkCreateSuccess, KeyLinkUpdateSuccess, KeyLinkDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class KeyLinkService(BaseService):
    def __init__(self, repository: BaseRepository, level: int,
                 user: Optional[UserSchema] = None, session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)
        self.level = level

    async def get_by_id(self, id: int) -> KeyLinkSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(KeyLinkNotFound(self.level, id))
        return self._to_schema(row)

    async def list_key_links(self, parent_id: Optional[int] = None) -> List[KeyLinkSchema]:
        filters = None
        if parent_id is not None:
            filters = {"parent_id": parent_id}
        rows = await self.repository.get_all(filters=filters)
        return [self._to_schema(r) for r in rows]

    @staticmethod
    def _to_schema(row) -> KeyLinkSchema:
        s = KeyLinkSchema.model_validate(row)
        if hasattr(row, "status") and row.status:
            s.status_name = row.status.name_u or row.status.name_e
        if hasattr(row, "key") and row.key:
            s.key_name = row.key.name
        if hasattr(row, "parent"):
            parent = row.parent
            if hasattr(parent, "name"):
                s.parent_name = parent.name
            elif hasattr(parent, "key") and parent.key:
                s.parent_name = parent.key.name
        return s

    async def create_key_link(self, body: KeyLinkCreate) -> MutationResponse[KeyLinkSchema]:
        try:
            created = await self.create(body)
            schema = self._to_schema(await self.repository.get_by_id(created.id))
            detail = await self._resolve_domain_success(KeyLinkCreateSuccess(self.level))
            return MutationResponse(detail=detail, data=schema)
        except IntegrityError:
            raise

    async def update_key_link(self, id: int, body: KeyLinkUpdate) -> MutationResponse[KeyLinkSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(KeyLinkNotFound(self.level, id))
        try:
            updated = await self.update(orm, body, partial=True)
            schema = self._to_schema(await self.repository.get_by_id(updated.id))
            detail = await self._resolve_domain_success(KeyLinkUpdateSuccess(self.level))
            return MutationResponse(detail=detail, data=schema)
        except IntegrityError:
            raise

    async def delete_key_link(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(KeyLinkNotFound(self.level, id))
        await self.delete_by_id(
            id,
            name=id,
            delete_error_exc=KeyLinkDeleteError,
        )
        detail = await self._resolve_domain_success(KeyLinkDeleteSuccess(self.level))
        return MutationResponse(detail=detail, data=None)
