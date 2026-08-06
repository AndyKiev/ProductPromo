from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.nomenclature_key.nomenclature_key_schema import NomenclatureKey as NomenclatureKeySchema, NomenclatureKeyCreate, NomenclatureKeyUpdate
from backend.api_v1.nomenclature_key.nomenclature_key_dependencies import get_nomenclature_key_service, nomenclature_key_by_id
from backend.api_v1.nomenclature_key.nomenclature_key_service import NomenclatureKeyService

router = APIRouter(
    prefix="/nomenclature/keys",
    tags=["Nomenclature"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[NomenclatureKeySchema])
async def list_nomenclature_key(
    service: Annotated[NomenclatureKeyService, Depends(get_nomenclature_key_service)],
    sort: Optional[str] = Query(None),
    q: Optional[str] = Query(None, description="Search by name (substring, case-insensitive)"),
    limit: int = Query(20, ge=1, le=200),
):
    return await service.list_nomenclature_key(sort=sort, q=q, limit=limit)


@router.get("/{item_id}", response_model=NomenclatureKeySchema)
async def get_nomenclature_key(item: NomenclatureKeySchema = Depends(nomenclature_key_by_id)):
    return item


@router.post("", response_model=MutationResponse[NomenclatureKeySchema], status_code=status.HTTP_201_CREATED)
async def create_nomenclature_key(
    body: NomenclatureKeyCreate,
    service: Annotated[NomenclatureKeyService, Depends(get_nomenclature_key_service)],
):
    return await service.create_nomenclature_key(body)


@router.patch("/{item_id}", response_model=MutationResponse[NomenclatureKeySchema])
async def update_nomenclature_key(
    body: NomenclatureKeyUpdate,
    item: NomenclatureKeySchema = Depends(nomenclature_key_by_id),
    service: NomenclatureKeyService = Depends(get_nomenclature_key_service),
):
    return await service.update_nomenclature_key(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_nomenclature_key(
    item_id: int,
    service: Annotated[NomenclatureKeyService, Depends(get_nomenclature_key_service)],
):
    return await service.delete_nomenclature_key(item_id)
