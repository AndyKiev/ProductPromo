from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.nomenclature_key.nomenclature_key_schema import NomenclatureKey as NomenclatureKeySchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.nomenclature_key.nomenclature_key_repository import NomenclatureKeyRepository
from backend.api_v1.nomenclature_key.nomenclature_key_service import NomenclatureKeyService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_nomenclature_key_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> NomenclatureKeyService:
    return NomenclatureKeyService(
        repository=NomenclatureKeyRepository(session=session),
        user=user,
        session=session,
    )


async def nomenclature_key_by_id(
    nomenclature_key_id: int,
    service: NomenclatureKeyService = Depends(get_nomenclature_key_service),
) -> NomenclatureKeySchema:
    return await service.get_by_id(nomenclature_key_id)
