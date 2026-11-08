from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.promo_type_subtype.promo_type_subtype_schema import (
    PromoTypeSubtype as PromoTypeSubtypeSchema,
    PromoTypeSubtypeCreate,
    PromoTypeSubtypeUpdate,
)
from backend.api_v1.promo_type_subtype.promo_type_subtype_dependencies import (
    get_promo_type_subtype_service,
    promo_type_subtype_by_id,
)
from backend.api_v1.promo_type_subtype.promo_type_subtype_service import PromoTypeSubtypeService

router = APIRouter(
    prefix="/promo-type-subtypes",
    tags=["Promo"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)

Service = Annotated[PromoTypeSubtypeService, Depends(get_promo_type_subtype_service)]


@router.get("", response_model=List[PromoTypeSubtypeSchema])
async def list_promo_type_subtypes(service: Service, sort: Optional[str] = Query(None)):
    return await service.list_links(sort=sort)


@router.get("/{item_id}", response_model=PromoTypeSubtypeSchema)
async def get_promo_type_subtype(item: PromoTypeSubtypeSchema = Depends(promo_type_subtype_by_id)):
    return item


@router.post("", response_model=MutationResponse[PromoTypeSubtypeSchema], status_code=status.HTTP_201_CREATED)
async def create_promo_type_subtype(body: PromoTypeSubtypeCreate, service: Service):
    return await service.create_link(body)


@router.patch("/{item_id}", response_model=MutationResponse[PromoTypeSubtypeSchema])
async def update_promo_type_subtype(item_id: int, body: PromoTypeSubtypeUpdate, service: Service):
    return await service.update_link(item_id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_promo_type_subtype(item_id: int, service: Service):
    return await service.delete_link(item_id)
