from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.tax_rate.tax_rate_repository import TaxRateRepository
from backend.api_v1.tax_rate.tax_rate_schema import (
    TaxRate as TaxRateSchema,
    TaxRateCreate,
    TaxRateUpdate,
)
from backend.api_v1.tax_rate.tax_rate_errors import TaxRateNotFound, TaxRateDeleteError
from backend.api_v1.tax_rate.tax_rate_success import (
    TaxRateCreateSuccess,
    TaxRateUpdateSuccess,
    TaxRateDeleteSuccess,
)
from backend.api_v1.tax_type.tax_type_model import TaxType
from backend.api_v1.tax_type.tax_type_errors import TaxTypeNotFound
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class TaxRateService(BaseService):
    def __init__(self, repository: TaxRateRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    def _to_schema(self, row) -> TaxRateSchema:
        s = TaxRateSchema.model_validate(row)
        s.tax_type_code = row.tax_type.code if row.tax_type else None
        s.tax_type_name = row.tax_type.name if row.tax_type else None
        return s

    @staticmethod
    def _label(row) -> str:
        tax = row.tax_type.code if row.tax_type else "?"
        return f"{tax} {row.rate}%"

    async def get_by_id(self, id: int) -> TaxRateSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(TaxRateNotFound(id))
        return self._to_schema(row)

    async def list_tax_rates(self, tax_type_id: Optional[int] = None,
                             sort: Optional[str] = None) -> List[TaxRateSchema]:
        if tax_type_id is not None:
            rows = await self.repository.by_tax_type(tax_type_id)
        else:
            rows = await self.get_all(sort_json=sort)
        return [self._to_schema(r) for r in rows]

    async def _ensure_tax_type(self, tax_type_id: int) -> None:
        if await self.session.get(TaxType, tax_type_id) is None:
            raise await self._resolve_domain_error(TaxTypeNotFound(tax_type_id))

    # -- write -----------------------------------------------------------
    async def create_tax_rate(self, body: TaxRateCreate) -> MutationResponse[TaxRateSchema]:
        await self._ensure_tax_type(body.tax_type_id)
        created = await self.create(body)
        schema = self._to_schema(await self.repository.get_by_id(created.id))
        detail = await self._resolve_domain_success(TaxRateCreateSuccess(self._label(schema)))
        return MutationResponse(**detail, data=schema)

    async def update_tax_rate(self, id: int, body: TaxRateUpdate) -> MutationResponse[TaxRateSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(TaxRateNotFound(id))
        if body.tax_type_id is not None:
            await self._ensure_tax_type(body.tax_type_id)
        updated = await self.update(orm, body, partial=True)
        schema = self._to_schema(await self.repository.get_by_id(updated.id))
        detail = await self._resolve_domain_success(TaxRateUpdateSuccess(self._label(schema)))
        return MutationResponse(**detail, data=schema)

    async def delete_tax_rate(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(TaxRateNotFound(id))
        await self.delete_by_id(
            id,
            name=self._label(obj),
            delete_error_exc=TaxRateDeleteError,
            delete_success_exc=TaxRateDeleteSuccess,
        )
        detail = await self._resolve_domain_success(TaxRateDeleteSuccess(self._label(obj)))
        return MutationResponse(**detail, data=None)
