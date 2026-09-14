from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.i18n import lang_suffix_for, localized_name
from backend.api_v1.segment.segment_repository import SegmentRepository
from backend.api_v1.segment.segment_schema import Segment as SegmentSchema, SegmentCreate, SegmentUpdate
from backend.api_v1.segment.segment_errors import SegmentNotFound, SegmentNameTaken, SegmentDeleteError
from backend.api_v1.segment.segment_success import (
    SegmentCreateSuccess,
    SegmentUpdateSuccess,
    SegmentDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class SegmentService(BaseService):
    def __init__(self, repository: SegmentRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> SegmentSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(SegmentNotFound(id))
        return self._to_schema(row)

    async def list_segment(self, market_id: Optional[int] = None, sort: Optional[str] = None) -> List[SegmentSchema]:
        if market_id is not None:
            rows = await self.repository.by_parent(market_id)
        else:
            rows = await self.get_all(sort_json=sort)
        return [self._to_schema(r) for r in rows]

    def _to_schema(self, row) -> SegmentSchema:
        s = SegmentSchema.model_validate(row)
        suffix = lang_suffix_for(self.user)
        s.status_name = localized_name(row.status, suffix)
        s.market_name = row.market.name if row.market else None
        return s

    # -- write -----------------------------------------------------------
    async def create_segment(self, body: SegmentCreate) -> MutationResponse[SegmentSchema]:
        await self.exists_by_name(body.name, already_exists_exc=SegmentNameTaken)
        try:
            created = await self.create(body)
            schema = self._to_schema(await self.repository.get_by_id(created.id))
            detail = await self._resolve_domain_success(SegmentCreateSuccess(body.name))
            return MutationResponse(**detail, data=schema)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(SegmentNameTaken(body.name))
            raise

    async def update_segment(self, id: int, body: SegmentUpdate) -> MutationResponse[SegmentSchema]:
        if body.name:
            await self.exists_by_name(body.name, already_exists_exc=SegmentNameTaken, exclude_id=id)
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(SegmentNotFound(id))
        try:
            updated = await self.update(orm, body, partial=True)
            schema = self._to_schema(await self.repository.get_by_id(updated.id))
            detail = await self._resolve_domain_success(SegmentUpdateSuccess(schema.name))
            return MutationResponse(**detail, data=schema)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(SegmentNameTaken(body.name))
            raise

    async def delete_segment(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(SegmentNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.name,
            delete_error_exc=SegmentDeleteError,
            delete_success_exc=SegmentDeleteSuccess,
        )
        detail = await self._resolve_domain_success(SegmentDeleteSuccess(obj.name))
        return MutationResponse(**detail, data=None)