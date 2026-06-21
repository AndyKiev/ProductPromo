from fastapi import APIRouter, Depends, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.status_type.status_type_schema import StatusType as StatusTypeSchema
from backend.api_v1.status_type.status_type_dependencies import get_status_type_service
from backend.api_v1.status_type.status_type_service import StatusTypeService

router = APIRouter(
    prefix="/directories/status_types",
    tags=["Directories"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[StatusTypeSchema])
async def list_status_types(
    service: Annotated[StatusTypeService, Depends(get_status_type_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_status_types(sort=sort)
