from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.segment.segment_schema import Segment as SegmentSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema
from backend.api_v1.segment.segment_repository import SegmentRepository
from backend.api_v1.segment.segment_service import SegmentService
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user


async def get_segment_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> SegmentService:
    return SegmentService(
        repository=SegmentRepository(session=session),
        user=user,
        session=session,
    )


async def segment_by_id(
    item_id: int,
    service: SegmentService = Depends(get_segment_service),
) -> SegmentSchema:
    return await service.get_by_id(item_id)
