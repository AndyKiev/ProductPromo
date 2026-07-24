from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.nomenclature.nomenclature_schema import Nomenclature as NomenclatureSchema, NomenclatureCreate, NomenclatureUpdate
from backend.api_v1.nomenclature.nomenclature_dependencies import get_nomenclature_service, nomenclature_by_id
from backend.api_v1.nomenclature.nomenclature_service import NomenclatureService

router = APIRouter(
    prefix="/nomenclature/links",
    tags=["Nomenclature"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[NomenclatureSchema])
async def list_nomenclature(
    service: Annotated[NomenclatureService, Depends(get_nomenclature_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_nomenclature(sort=sort)


@router.get("/{item_id}", response_model=NomenclatureSchema)
async def get_nomenclature(item: NomenclatureSchema = Depends(nomenclature_by_id)):
    return item


@router.post("", response_model=MutationResponse[NomenclatureSchema], status_code=status.HTTP_201_CREATED)
async def create_nomenclature(
    body: NomenclatureCreate,
    service: Annotated[NomenclatureService, Depends(get_nomenclature_service)],
):
    return await service.create_nomenclature(body)


@router.patch("/{item_id}", response_model=MutationResponse[NomenclatureSchema])
async def update_nomenclature(
    body: NomenclatureUpdate,
    item: NomenclatureSchema = Depends(nomenclature_by_id),
    service: NomenclatureService = Depends(get_nomenclature_service),
):
    return await service.update_nomenclature(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_nomenclature(
    item_id: int,
    service: Annotated[NomenclatureService, Depends(get_nomenclature_service)],
):
    return await service.delete_nomenclature(item_id)
