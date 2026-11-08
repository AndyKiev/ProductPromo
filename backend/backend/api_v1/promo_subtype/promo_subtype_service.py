from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.promo_subtype.promo_subtype_repository import PromoSubtypeRepository
from backend.api_v1.promo_subtype.promo_subtype_schema import (
    PromoSubtype as PromoSubtypeSchema,
    PromoSubtypeCreate,
    PromoSubtypeUpdate,
)
from backend.api_v1.promo_subtype.promo_subtype_errors import (
    PromoSubtypeNotFound,
    PromoSubtypeTaken,
    PromoSubtypeDeleteError,
)
from backend.api_v1.promo_subtype.promo_subtype_success import (
    PromoSubtypeCreateSuccess,
    PromoSubtypeUpdateSuccess,
    PromoSubtypeDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class PromoSubtypeService(BaseService):
    def __init__(self, repository: PromoSubtypeRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> PromoSubtypeSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(PromoSubtypeNotFound(id))
        return PromoSubtypeSchema.model_validate(row)

    async def list_promo_subtypes(self, sort: Optional[str] = None) -> List[PromoSubtypeSchema]:
        rows = await self.get_all(sort_json=sort)
        return [PromoSubtypeSchema.model_validate(r) for r in rows]

    async def _ensure_code_free(self, code: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_code(code):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(PromoSubtypeTaken(code))

    # -- write -----------------------------------------------------------
    async def create_promo_subtype(self, body: PromoSubtypeCreate) -> MutationResponse[PromoSubtypeSchema]:
        await self._ensure_code_free(body.code)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(PromoSubtypeTaken(body.code))
            raise
        detail = await self._resolve_domain_success(PromoSubtypeCreateSuccess(body.code))
        return MutationResponse(**detail, data=PromoSubtypeSchema.model_validate(created))

    async def update_promo_subtype(self, id: int, body: PromoSubtypeUpdate) -> MutationResponse[PromoSubtypeSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(PromoSubtypeNotFound(id))
        if body.code:
            await self._ensure_code_free(body.code, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(PromoSubtypeTaken(body.code or ""))
            raise
        detail = await self._resolve_domain_success(PromoSubtypeUpdateSuccess(updated.code))
        return MutationResponse(**detail, data=PromoSubtypeSchema.model_validate(updated))

    async def delete_promo_subtype(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(PromoSubtypeNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.code,
            delete_error_exc=PromoSubtypeDeleteError,
            delete_success_exc=PromoSubtypeDeleteSuccess,
        )
        detail = await self._resolve_domain_success(PromoSubtypeDeleteSuccess(obj.code))
        return MutationResponse(**detail, data=None)
