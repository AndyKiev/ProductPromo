from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.product_status.product_status_repository import ProductStatusRepository
from backend.api_v1.product_status.product_status_schema import (
    ProductStatus as ProductStatusSchema,
    ProductStatusCreate,
    ProductStatusUpdate,
)
from backend.api_v1.product_status.product_status_errors import (
    ProductStatusNotFound,
    ProductStatusCodeTaken,
    ProductStatusDeleteError,
)
from backend.api_v1.product_status.product_status_success import (
    ProductStatusCreateSuccess,
    ProductStatusUpdateSuccess,
    ProductStatusDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class ProductStatusService(BaseService):
    def __init__(self, repository: ProductStatusRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> ProductStatusSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(ProductStatusNotFound(id))
        return ProductStatusSchema.model_validate(row)

    async def list_product_statuses(self, sort: Optional[str] = None) -> List[ProductStatusSchema]:
        rows = await self.get_all(sort_json=sort)
        return [ProductStatusSchema.model_validate(r) for r in rows]

    async def _ensure_code_free(self, code: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_code(code):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(ProductStatusCodeTaken(code))

    # -- write -----------------------------------------------------------
    async def create_product_status(self, body: ProductStatusCreate) -> MutationResponse[ProductStatusSchema]:
        await self._ensure_code_free(body.code)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(ProductStatusCodeTaken(body.code))
            raise
        detail = await self._resolve_domain_success(ProductStatusCreateSuccess(body.code))
        return MutationResponse(detail=detail, data=ProductStatusSchema.model_validate(created))

    async def update_product_status(self, id: int, body: ProductStatusUpdate) -> MutationResponse[ProductStatusSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(ProductStatusNotFound(id))
        if body.code:
            await self._ensure_code_free(body.code, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(ProductStatusCodeTaken(body.code or ""))
            raise
        detail = await self._resolve_domain_success(ProductStatusUpdateSuccess(updated.code))
        return MutationResponse(detail=detail, data=ProductStatusSchema.model_validate(updated))

    async def delete_product_status(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(ProductStatusNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.code,
            delete_error_exc=ProductStatusDeleteError,
            delete_success_exc=ProductStatusDeleteSuccess,
        )
        detail = await self._resolve_domain_success(ProductStatusDeleteSuccess(obj.code))
        return MutationResponse(detail=detail, data=None)
