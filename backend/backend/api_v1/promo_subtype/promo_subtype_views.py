from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.promo_subtype.promo_subtype_schema import (
    PromoSubtype as PromoSubtypeSchema,
    PromoSubtypeCreate,
    PromoSubtypeUpdate,
)
from backend.api_v1.promo_subtype.promo_subtype_dependencies import (
    get_promo_subtype_service,
    promo_subtype_by_id,
)
from backend.api_v1.promo_subtype.promo_subtype_service import PromoSubtypeService

router = APIRouter(
    prefix="/promo-subtypes",
    tags=["Promo"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[PromoSubtypeSchema])
async def list_promo_subtypes(
    service: Annotated[PromoSubtypeService, Depends(get_promo_subtype_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_promo_subtypes(sort=sort)


@router.get("/{item_id}", response_model=PromoSubtypeSchema)
async def get_promo_subtype(item: PromoSubtypeSchema = Depends(promo_subtype_by_id)):
    return item


@router.post("", response_model=MutationResponse[PromoSubtypeSchema], status_code=status.HTTP_201_CREATED)
async def create_promo_subtype(
    body: PromoSubtypeCreate,
    service: Annotated[PromoSubtypeService, Depends(get_promo_subtype_service)],
):
    return await service.create_promo_subtype(body)


@router.patch("/{item_id}", response_model=MutationResponse[PromoSubtypeSchema])
async def update_promo_subtype(
    body: PromoSubtypeUpdate,
    item: PromoSubtypeSchema = Depends(promo_subtype_by_id),
    service: PromoSubtypeService = Depends(get_promo_subtype_service),
):
    return await service.update_promo_subtype(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_promo_subtype(
    item_id: int,
    service: Annotated[PromoSubtypeService, Depends(get_promo_subtype_service)],
):
    return await service.delete_promo_subtype(item_id)
