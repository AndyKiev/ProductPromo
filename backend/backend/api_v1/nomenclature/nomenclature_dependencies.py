from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.nomenclature.nomenclature_schema import Nomenclature as NomenclatureSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.nomenclature.nomenclature_repository import NomenclatureRepository
from backend.api_v1.nomenclature.nomenclature_service import NomenclatureService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_nomenclature_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> NomenclatureService:
    return NomenclatureService(
        repository=NomenclatureRepository(session=session),
        user=user,
        session=session,
    )


async def nomenclature_by_id(
    nomenclature_id: int,
    service: NomenclatureService = Depends(get_nomenclature_service),
) -> NomenclatureSchema:
    return await service.get_by_id(nomenclature_id)
