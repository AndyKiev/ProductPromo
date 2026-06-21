from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.category.category_schema import Category as CategorySchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.category.category_repository import CategoryRepository
from backend.api_v1.category.category_service import CategoryService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_category_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> CategoryService:
    return CategoryService(
        repository=CategoryRepository(session=session),
        user=user,
        session=session,
    )


async def category_by_id(
    category_id: int,
    service: CategoryService = Depends(get_category_service),
) -> CategorySchema:
    return await service.get_by_id(category_id)
