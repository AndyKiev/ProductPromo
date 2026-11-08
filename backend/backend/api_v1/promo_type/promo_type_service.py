from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.promo_type.promo_type_repository import PromoTypeRepository
from backend.api_v1.promo_type.promo_type_schema import (
    PromoType as PromoTypeSchema,
    PromoTypeCreate,
    PromoTypeUpdate,
)
from backend.api_v1.promo_type.promo_type_errors import (
    PromoTypeNotFound,
    PromoTypeTaken,
    PromoTypeDeleteError,
)
from backend.api_v1.promo_type.promo_type_success import (
    PromoTypeCreateSuccess,
    PromoTypeUpdateSuccess,
    PromoTypeDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class PromoTypeService(BaseService):
    def __init__(self, repository: PromoTypeRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> PromoTypeSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(PromoTypeNotFound(id))
        return PromoTypeSchema.model_validate(row)

    async def list_promo_types(self, sort: Optional[str] = None) -> List[PromoTypeSchema]:
        rows = await self.get_all(sort_json=sort)
        return [PromoTypeSchema.model_validate(r) for r in rows]

    async def _ensure_code_free(self, code: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_code(code):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(PromoTypeTaken(code))

    # -- write -----------------------------------------------------------
    async def create_promo_type(self, body: PromoTypeCreate) -> MutationResponse[PromoTypeSchema]:
        await self._ensure_code_free(body.code)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(PromoTypeTaken(body.code))
            raise
        detail = await self._resolve_domain_success(PromoTypeCreateSuccess(body.code))
        return MutationResponse(**detail, data=PromoTypeSchema.model_validate(created))

    async def update_promo_type(self, id: int, body: PromoTypeUpdate) -> MutationResponse[PromoTypeSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(PromoTypeNotFound(id))
        if body.code:
            await self._ensure_code_free(body.code, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(PromoTypeTaken(body.code or ""))
            raise
        detail = await self._resolve_domain_success(PromoTypeUpdateSuccess(updated.code))
        return MutationResponse(**detail, data=PromoTypeSchema.model_validate(updated))

    async def delete_promo_type(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(PromoTypeNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.code,
            delete_error_exc=PromoTypeDeleteError,
            delete_success_exc=PromoTypeDeleteSuccess,
        )
        detail = await self._resolve_domain_success(PromoTypeDeleteSuccess(obj.code))
        return MutationResponse(**detail, data=None)
