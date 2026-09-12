from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.ean.ean_repository import EanRepository
from backend.api_v1.ean.ean_schema import (
    Ean as EanSchema,
    EanCreate,
    EanUpdate,
)
from backend.api_v1.ean.ean_errors import (
    EanNotFound,
    EanTaken,
    EanDeleteError,
)
from backend.api_v1.ean.ean_success import (
    EanCreateSuccess,
    EanUpdateSuccess,
    EanDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class EanService(BaseService):
    def __init__(self, repository: EanRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> EanSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(EanNotFound(id))
        return EanSchema.model_validate(row)

    async def list_eans(self, product_id: int, q: Optional[str] = None) -> List[EanSchema]:
        rows = await self.repository.list_by_product(product_id, q=q)
        return [EanSchema.model_validate(r) for r in rows]

    async def _ensure_ean_free(self, ean: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_ean(ean):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(EanTaken(ean))

    # -- write -----------------------------------------------------------
    async def create_ean(self, body: EanCreate) -> MutationResponse[EanSchema]:
        await self._ensure_ean_free(body.ean)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(EanTaken(body.ean))
            raise
        detail = await self._resolve_domain_success(EanCreateSuccess(body.ean))
        return MutationResponse(detail=detail, data=EanSchema.model_validate(created))

    async def update_ean(self, id: int, body: EanUpdate) -> MutationResponse[EanSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(EanNotFound(id))
        if body.ean:
            await self._ensure_ean_free(body.ean, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(EanTaken(body.ean or ""))
            raise
        detail = await self._resolve_domain_success(EanUpdateSuccess(updated.ean))
        return MutationResponse(detail=detail, data=EanSchema.model_validate(updated))

    async def delete_ean(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(EanNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.ean,
            delete_error_exc=EanDeleteError,
            delete_success_exc=EanDeleteSuccess,
        )
        detail = await self._resolve_domain_success(EanDeleteSuccess(obj.ean))
        return MutationResponse(detail=detail, data=None)
