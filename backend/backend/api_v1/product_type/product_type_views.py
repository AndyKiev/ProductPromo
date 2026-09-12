from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.product_type.product_type_schema import (
    ProductType as ProductTypeSchema,
    ProductTypeCreate,
    ProductTypeUpdate,
)
from backend.api_v1.product_type.product_type_dependencies import (
    get_product_type_service,
    product_type_by_id,
)
from backend.api_v1.product_type.product_type_service import ProductTypeService

router = APIRouter(
    prefix="/product-types",
    tags=["Products"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[ProductTypeSchema])
async def list_product_types(
    service: Annotated[ProductTypeService, Depends(get_product_type_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_product_types(sort=sort)


@router.get("/{item_id}", response_model=ProductTypeSchema)
async def get_product_type(item: ProductTypeSchema = Depends(product_type_by_id)):
    return item


@router.post("", response_model=MutationResponse[ProductTypeSchema], status_code=status.HTTP_201_CREATED)
async def create_product_type(
    body: ProductTypeCreate,
    service: Annotated[ProductTypeService, Depends(get_product_type_service)],
):
    return await service.create_product_type(body)


@router.patch("/{item_id}", response_model=MutationResponse[ProductTypeSchema])
async def update_product_type(
    body: ProductTypeUpdate,
    item: ProductTypeSchema = Depends(product_type_by_id),
    service: ProductTypeService = Depends(get_product_type_service),
):
    return await service.update_product_type(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_product_type(
    item_id: int,
    service: Annotated[ProductTypeService, Depends(get_product_type_service)],
):
    return await service.delete_product_type(item_id)
