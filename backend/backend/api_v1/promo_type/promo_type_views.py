from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.promo_type.promo_type_schema import (
    PromoType as PromoTypeSchema,
    PromoTypeCreate,
    PromoTypeUpdate,
)
from backend.api_v1.promo_type.promo_type_dependencies import (
    get_promo_type_service,
    promo_type_by_id,
)
from backend.api_v1.promo_type.promo_type_service import PromoTypeService

router = APIRouter(
    prefix="/promo-types",
    tags=["Promo"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[PromoTypeSchema])
async def list_promo_types(
    service: Annotated[PromoTypeService, Depends(get_promo_type_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_promo_types(sort=sort)


@router.get("/{item_id}", response_model=PromoTypeSchema)
async def get_promo_type(item: PromoTypeSchema = Depends(promo_type_by_id)):
    return item


@router.post("", response_model=MutationResponse[PromoTypeSchema], status_code=status.HTTP_201_CREATED)
async def create_promo_type(
    body: PromoTypeCreate,
    service: Annotated[PromoTypeService, Depends(get_promo_type_service)],
):
    return await service.create_promo_type(body)


@router.patch("/{item_id}", response_model=MutationResponse[PromoTypeSchema])
async def update_promo_type(
    body: PromoTypeUpdate,
    item: PromoTypeSchema = Depends(promo_type_by_id),
    service: PromoTypeService = Depends(get_promo_type_service),
):
    return await service.update_promo_type(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_promo_type(
    item_id: int,
    service: Annotated[PromoTypeService, Depends(get_promo_type_service)],
):
    return await service.delete_promo_type(item_id)
