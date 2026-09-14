from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.i18n import lang_suffix_for, localized_name
from backend.api_v1.market.market_repository import MarketRepository
from backend.api_v1.market.market_schema import Market as MarketSchema, MarketCreate, MarketUpdate
from backend.api_v1.market.market_errors import MarketNotFound, MarketNameTaken, MarketDeleteError
from backend.api_v1.market.market_success import (
    MarketCreateSuccess,
    MarketUpdateSuccess,
    MarketDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class MarketService(BaseService):
    def __init__(self, repository: MarketRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> MarketSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(MarketNotFound(id))
        return self._to_schema(row)

    async def list_market(self, sort: Optional[str] = None) -> List[MarketSchema]:
        rows = await self.get_all(sort_json=sort)
        return [self._to_schema(r) for r in rows]

    def _to_schema(self, row) -> MarketSchema:
        s = MarketSchema.model_validate(row)
        pass
        return s

    # -- write -----------------------------------------------------------
    async def create_market(self, body: MarketCreate) -> MutationResponse[MarketSchema]:
        await self.exists_by_name(body.name, already_exists_exc=MarketNameTaken)
        try:
            created = await self.create(body)
            schema = self._to_schema(await self.repository.get_by_id(created.id))
            detail = await self._resolve_domain_success(MarketCreateSuccess(body.name))
            return MutationResponse(**detail, data=schema)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(MarketNameTaken(body.name))
            raise

    async def update_market(self, id: int, body: MarketUpdate) -> MutationResponse[MarketSchema]:
        if body.name:
            await self.exists_by_name(body.name, already_exists_exc=MarketNameTaken)
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(MarketNotFound(id))
        try:
            updated = await self.update(orm, body, partial=True)
            schema = self._to_schema(await self.repository.get_by_id(updated.id))
            detail = await self._resolve_domain_success(MarketUpdateSuccess(schema.name))
            return MutationResponse(**detail, data=schema)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(MarketNameTaken(body.name))
            raise

    async def delete_market(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(MarketNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.name,
            delete_error_exc=MarketDeleteError,
            delete_success_exc=MarketDeleteSuccess,
        )
        detail = await self._resolve_domain_success(MarketDeleteSuccess(obj.name))
        return MutationResponse(**detail, data=None)