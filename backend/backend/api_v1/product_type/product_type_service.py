from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.product_type.product_type_repository import ProductTypeRepository
from backend.api_v1.product_type.product_type_schema import (
    ProductType as ProductTypeSchema,
    ProductTypeCreate,
    ProductTypeUpdate,
)
from backend.api_v1.product_type.product_type_errors import (
    ProductTypeNotFound,
    ProductTypeTaken,
    ProductTypeDeleteError,
)
from backend.api_v1.product_type.product_type_success import (
    ProductTypeCreateSuccess,
    ProductTypeUpdateSuccess,
    ProductTypeDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class ProductTypeService(BaseService):
    def __init__(self, repository: ProductTypeRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> ProductTypeSchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(ProductTypeNotFound(id))
        return ProductTypeSchema.model_validate(row)

    async def list_product_types(self, sort: Optional[str] = None) -> List[ProductTypeSchema]:
        rows = await self.get_all(sort_json=sort)
        return [ProductTypeSchema.model_validate(r) for r in rows]

    async def _ensure_code_free(self, code: str, exclude_id: Optional[int] = None) -> None:
        for row in await self.repository.by_code(code):
            if row.id != exclude_id:
                raise await self._resolve_domain_error(ProductTypeTaken(code))

    # -- write -----------------------------------------------------------
    async def create_product_type(self, body: ProductTypeCreate) -> MutationResponse[ProductTypeSchema]:
        await self._ensure_code_free(body.code)
        try:
            created = await self.create(body)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(ProductTypeTaken(body.code))
            raise
        detail = await self._resolve_domain_success(ProductTypeCreateSuccess(body.code))
        return MutationResponse(detail=detail, data=ProductTypeSchema.model_validate(created))

    async def update_product_type(self, id: int, body: ProductTypeUpdate) -> MutationResponse[ProductTypeSchema]:
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(ProductTypeNotFound(id))
        if body.code:
            await self._ensure_code_free(body.code, exclude_id=id)
        try:
            updated = await self.update(orm, body, partial=True)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(ProductTypeTaken(body.code or ""))
            raise
        detail = await self._resolve_domain_success(ProductTypeUpdateSuccess(updated.code))
        return MutationResponse(detail=detail, data=ProductTypeSchema.model_validate(updated))

    async def delete_product_type(self, id: int) -> MutationResponse[None]:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(ProductTypeNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.code,
            delete_error_exc=ProductTypeDeleteError,
            delete_success_exc=ProductTypeDeleteSuccess,
        )
        detail = await self._resolve_domain_success(ProductTypeDeleteSuccess(obj.code))
        return MutationResponse(detail=detail, data=None)
