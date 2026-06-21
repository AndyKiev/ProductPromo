from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.i18n import lang_suffix_for, localized_name
from backend.api_v1.category.category_repository import CategoryRepository
from backend.api_v1.category.category_schema import Category as CategorySchema, CategoryCreate, CategoryUpdate
from backend.api_v1.category.category_errors import CategoryNotFound, CategoryNameTaken, CategoryDeleteError
from backend.api_v1.category.category_success import (
    CategoryCreateSuccess,
    CategoryUpdateSuccess,
    CategoryDeleteSuccess,
)
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class CategoryService(BaseService):
    def __init__(self, repository: CategoryRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    # -- read ------------------------------------------------------------
    async def get_by_id(self, id: int) -> CategorySchema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(CategoryNotFound(id))
        return self._to_schema(row)

    async def list_category(self, segment_id: Optional[int] = None, sort: Optional[str] = None) -> List[CategorySchema]:
        if segment_id is not None:
            rows = await self.repository.by_parent(segment_id)
        else:
            rows = await self.get_all(sort_json=sort)
        return [self._to_schema(r) for r in rows]

    def _to_schema(self, row) -> CategorySchema:
        s = CategorySchema.model_validate(row)
        suffix = lang_suffix_for(self.user)
        s.status_name = localized_name(row.status, suffix)
        s.segment_name = row.segment.name if row.segment else None
        return s

    # -- write -----------------------------------------------------------
    async def create_category(self, body: CategoryCreate) -> MutationResponse[CategorySchema]:
        await self.exists_by_name(body.name, already_exists_exc=CategoryNameTaken)
        try:
            created = await self.create(body)
            schema = self._to_schema(await self.repository.get_by_id(created.id))
            detail = await self._resolve_domain_success(CategoryCreateSuccess(body.name))
            return MutationResponse(detail=detail, data=schema)
        except IntegrityError:
            raise await self._resolve_domain_error(CategoryNameTaken(body.name))

    async def update_category(self, id: int, body: CategoryUpdate) -> MutationResponse[CategorySchema]:
        if body.name:
            await self.exists_by_name(body.name, already_exists_exc=CategoryNameTaken)
        orm = await self.repository.get_by_id(id)
        if not orm:
            raise await self._resolve_domain_error(CategoryNotFound(id))
        try:
            updated = await self.update(orm, body, partial=True)
            schema = self._to_schema(await self.repository.get_by_id(updated.id))
            detail = await self._resolve_domain_success(CategoryUpdateSuccess(schema.name))
            return MutationResponse(detail=detail, data=schema)
        except IntegrityError:
            raise await self._resolve_domain_error(CategoryNameTaken(body.name))

    async def delete_category(self, id: int) -> None:
        obj = await self.repository.get_by_id(id)
        if not obj:
            raise await self._resolve_domain_error(CategoryNotFound(id))
        await self.delete_by_id(
            id,
            name=obj.name,
            delete_error_exc=CategoryDeleteError,
            delete_success_exc=CategoryDeleteSuccess,
        )
