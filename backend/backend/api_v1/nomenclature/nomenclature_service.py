from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.i18n import lang_suffix_for, localized_name
from backend.api_v1.nomenclature.nomenclature_repository import NomenclatureRepository
from backend.api_v1.nomenclature.nomenclature_schema import Nomenclature as NomenclatureSchema, NomenclatureCreate, NomenclatureUpdate
from backend.api_v1.nomenclature.nomenclature_errors import NomenclatureNotFound, NomenclatureDeleteError
from backend.api_v1.nomenclature.nomenclature_success import (
    NomenclatureCreateSuccess,
    NomenclatureUpdateSuccess,
    NomenclatureDeleteSuccess,
)
from backend.api_v1.nomenclature.nomenclature_model import Nomenclature
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class NomenclatureService(BaseService):
    def __init__(self, repository: NomenclatureRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> NomenclatureSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(NomenclatureNotFound(id))
        return self._to_schema(row)

    async def list_nomenclature(self, sort: Optional[str] = None) -> List[NomenclatureSchema]:
        rows = await self.get_all(sort_json=sort)
        return [self._to_schema(r) for r in rows]

    def _to_schema(self, row) -> NomenclatureSchema:
        s = NomenclatureSchema.model_validate(row)
        s.market_name = row.market.name if row.market else None
        s.segment_name = row.segment.name if row.segment else None
        s.category_name = row.category.name if row.category else None
        s.family_name = row.family.name if row.family else None
        return s

    # -- write -----------------------------------------------------------
    async def create_nomenclature(self, body: NomenclatureCreate) -> MutationResponse[NomenclatureSchema]:
        instance = Nomenclature(**body.model_dump())
        if self.user is not None:
            instance.user_id = self.user.id
        created = await self.repository.create(instance)
        schema = self._to_schema(await self.repository.get_by_id(created.id))
        detail = await self._resolve_domain_success(NomenclatureCreateSuccess(str(created.id)))
        return MutationResponse(detail=detail, data=schema)

    async def update_nomenclature(self, id: int, body: NomenclatureUpdate) -> MutationResponse[NomenclatureSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(NomenclatureNotFound(id))
        updated = await self.update(orm, body, partial=True)
        schema = self._to_schema(await self.repository.get_by_id(updated.id))
        detail = await self._resolve_domain_success(NomenclatureUpdateSuccess(str(orm.id)))
        return MutationResponse(detail=detail, data=schema)

    async def delete_nomenclature(self, id: int) -> None:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(NomenclatureNotFound(id))
        await self.delete_by_id(
            id,
            name=str(obj.id),
            delete_error_exc=NomenclatureDeleteError,
            delete_success_exc=NomenclatureDeleteSuccess,
        )
