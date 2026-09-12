from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.import_code.import_code_schema import (
    ImportCode as ImportCodeSchema,
    ImportCodeCreate,
    ImportCodeUpdate,
)
from backend.api_v1.import_code.import_code_dependencies import (
    get_import_code_service,
    import_code_by_id,
)
from backend.api_v1.import_code.import_code_service import ImportCodeService

router = APIRouter(
    prefix="/import-codes",
    tags=["Products"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[ImportCodeSchema])
async def list_import_codes(
    service: Annotated[ImportCodeService, Depends(get_import_code_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_import_codes(sort=sort)


@router.get("/{item_id}", response_model=ImportCodeSchema)
async def get_import_code(item: ImportCodeSchema = Depends(import_code_by_id)):
    return item


@router.post("", response_model=MutationResponse[ImportCodeSchema], status_code=status.HTTP_201_CREATED)
async def create_import_code(
    body: ImportCodeCreate,
    service: Annotated[ImportCodeService, Depends(get_import_code_service)],
):
    return await service.create_import_code(body)


@router.patch("/{item_id}", response_model=MutationResponse[ImportCodeSchema])
async def update_import_code(
    body: ImportCodeUpdate,
    item: ImportCodeSchema = Depends(import_code_by_id),
    service: ImportCodeService = Depends(get_import_code_service),
):
    return await service.update_import_code(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_import_code(
    item_id: int,
    service: Annotated[ImportCodeService, Depends(get_import_code_service)],
):
    return await service.delete_import_code(item_id)
