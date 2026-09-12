from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.ean.ean_schema import (
    Ean as EanSchema,
    EanCreate,
    EanUpdate,
)
from backend.api_v1.ean.ean_dependencies import get_ean_service, ean_by_id
from backend.api_v1.ean.ean_service import EanService

router = APIRouter(
    prefix="/eans",
    tags=["Products"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[EanSchema])
async def list_eans(
    service: Annotated[EanService, Depends(get_ean_service)],
    product_id: int = Query(..., ge=1),
    q: Optional[str] = Query(None),
):
    return await service.list_eans(product_id, q=q)


@router.get("/{item_id}", response_model=EanSchema)
async def get_ean(item: EanSchema = Depends(ean_by_id)):
    return item


@router.post("", response_model=MutationResponse[EanSchema], status_code=status.HTTP_201_CREATED)
async def create_ean(
    body: EanCreate,
    service: Annotated[EanService, Depends(get_ean_service)],
):
    return await service.create_ean(body)


@router.patch("/{item_id}", response_model=MutationResponse[EanSchema])
async def update_ean(
    body: EanUpdate,
    item: EanSchema = Depends(ean_by_id),
    service: EanService = Depends(get_ean_service),
):
    return await service.update_ean(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_ean(
    item_id: int,
    service: Annotated[EanService, Depends(get_ean_service)],
):
    return await service.delete_ean(item_id)
