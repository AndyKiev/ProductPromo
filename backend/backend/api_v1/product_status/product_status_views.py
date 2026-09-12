from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.product_status.product_status_schema import (
    ProductStatus as ProductStatusSchema,
    ProductStatusCreate,
    ProductStatusUpdate,
)
from backend.api_v1.product_status.product_status_dependencies import (
    get_product_status_service,
    product_status_by_id,
)
from backend.api_v1.product_status.product_status_service import ProductStatusService

router = APIRouter(
    prefix="/product-statuses",
    tags=["Products"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[ProductStatusSchema])
async def list_product_statuses(
    service: Annotated[ProductStatusService, Depends(get_product_status_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_product_statuses(sort=sort)


@router.get("/{item_id}", response_model=ProductStatusSchema)
async def get_product_status(item: ProductStatusSchema = Depends(product_status_by_id)):
    return item


@router.post("", response_model=MutationResponse[ProductStatusSchema], status_code=status.HTTP_201_CREATED)
async def create_product_status(
    body: ProductStatusCreate,
    service: Annotated[ProductStatusService, Depends(get_product_status_service)],
):
    return await service.create_product_status(body)


@router.patch("/{item_id}", response_model=MutationResponse[ProductStatusSchema])
async def update_product_status(
    body: ProductStatusUpdate,
    item: ProductStatusSchema = Depends(product_status_by_id),
    service: ProductStatusService = Depends(get_product_status_service),
):
    return await service.update_product_status(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_product_status(
    item_id: int,
    service: Annotated[ProductStatusService, Depends(get_product_status_service)],
):
    return await service.delete_product_status(item_id)
