from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.promo_type.promo_type_errors import PromoTypeNotFound
from backend.api_v1.promo_type.promo_type_model import PromoType
from backend.api_v1.promo_subtype.promo_subtype_errors import PromoSubtypeNotFound
from backend.api_v1.promo_subtype.promo_subtype_model import PromoSubtype
from backend.api_v1.promo_type_subtype.promo_type_subtype_errors import (
    PromoTypeSubtypeNotFound,
    PromoTypeSubtypeTaken,
)
from backend.api_v1.promo_type_subtype.promo_type_subtype_repository import PromoTypeSubtypeRepository
from backend.api_v1.promo_type_subtype.promo_type_subtype_schema import (
    PromoTypeSubtype as PromoTypeSubtypeSchema,
    PromoTypeSubtypeCreate,
    PromoTypeSubtypeUpdate,
)
from backend.api_v1.promo_type_subtype.promo_type_subtype_success import (
    PromoTypeSubtypeCreateSuccess,
    PromoTypeSubtypeUpdateSuccess,
    PromoTypeSubtypeDeleteSuccess,
)


class PromoTypeSubtypeService(BaseService):
    def __init__(self, repository: PromoTypeSubtypeRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> PromoTypeSubtypeSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(PromoTypeSubtypeNotFound(id))
        return PromoTypeSubtypeSchema.model_validate(row)

    async def list_links(self, sort: Optional[str] = None) -> List[PromoTypeSubtypeSchema]:
        return [PromoTypeSubtypeSchema.model_validate(r) for r in await self.get_all(sort_json=sort)]

    # -- helpers ---------------------------------------------------------
    async def _codes(self, promo_type_id: int, promo_subtype_id: int) -> tuple[str, str]:
        """Resolve both ends; a missing one raises its own domain 404."""
        promo_type = await self.session.get(PromoType, promo_type_id)
        if not promo_type:
            raise await self._resolve_domain_error(PromoTypeNotFound(promo_type_id))
        subtype = await self.session.get(PromoSubtype, promo_subtype_id)
        if not subtype:
            raise await self._resolve_domain_error(PromoSubtypeNotFound(promo_subtype_id))
        return promo_type.code, subtype.code

    async def _ensure_pair_free(self, type_id: int, subtype_id: int, codes: tuple[str, str],
                                exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_pair(type_id, subtype_id):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(PromoTypeSubtypeTaken(*codes))

    # -- write -----------------------------------------------------------
    async def create_link(self, body: PromoTypeSubtypeCreate) -> MutationResponse[PromoTypeSubtypeSchema]:
        codes = await self._codes(body.promo_type_id, body.promo_subtype_id)
        await self._ensure_pair_free(body.promo_type_id, body.promo_subtype_id, codes)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(PromoTypeSubtypeTaken(*codes))
            raise
        detail = await self._resolve_domain_success(PromoTypeSubtypeCreateSuccess(*codes))
        return MutationResponse(**detail, data=PromoTypeSubtypeSchema.model_validate(created))

    async def update_link(self, id: int, body: PromoTypeSubtypeUpdate) -> MutationResponse[PromoTypeSubtypeSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(PromoTypeSubtypeNotFound(id))
        type_id = body.promo_type_id or orm.promo_type_id
        subtype_id = body.promo_subtype_id or orm.promo_subtype_id
        codes = await self._codes(type_id, subtype_id)
        await self._ensure_pair_free(type_id, subtype_id, codes, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(PromoTypeSubtypeTaken(*codes))
            raise
        detail = await self._resolve_domain_success(PromoTypeSubtypeUpdateSuccess(*codes))
        return MutationResponse(**detail, data=PromoTypeSubtypeSchema.model_validate(updated))

    async def delete_link(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(PromoTypeSubtypeNotFound(id))
        codes = await self._codes(obj.promo_type_id, obj.promo_subtype_id)
        await self.repository.delete(obj)
        detail = await self._resolve_domain_success(PromoTypeSubtypeDeleteSuccess(*codes))
        return MutationResponse(**detail, data=None)
