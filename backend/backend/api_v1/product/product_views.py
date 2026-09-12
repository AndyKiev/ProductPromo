from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.page import Page
from backend.api_v1.product.product_schema import (
    Product as ProductSchema,
    ProductCreate,
    ProductUpdate,
)
from backend.api_v1.product.product_dependencies import get_product_service, product_by_id
from backend.api_v1.product.product_service import ProductService

router = APIRouter(
    prefix="/products",
    tags=["Products"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=Page[ProductSchema])
async def list_products(
    service: Annotated[ProductService, Depends(get_product_service)],
    q: Optional[str] = Query(None),
    market_id: Optional[int] = Query(None),
    segment_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    family_id: Optional[int] = Query(None),
    nomenclature_id: Optional[int] = Query(None),
    status_id: Optional[int] = Query(None),
    import_code_id: Optional[int] = Query(None),
    product_type_id: Optional[int] = Query(None),
    supplier_id: Optional[int] = Query(None),
    ean: Optional[str] = Query(None),
    page: int = Query(0, ge=0),
    page_size: int = Query(25, ge=1, le=200),
    sort: Optional[str] = Query(None),
    order: str = Query("asc"),
):
    return await service.list_products(
        q=q, market_id=market_id, segment_id=segment_id, category_id=category_id,
        family_id=family_id, nomenclature_id=nomenclature_id, status_id=status_id,
        import_code_id=import_code_id, product_type_id=product_type_id, supplier_id=supplier_id,
        ean=ean, page=page, page_size=page_size, sort=sort, order=order,
    )


@router.get("/{item_id}", response_model=ProductSchema)
async def get_product(item: ProductSchema = Depends(product_by_id)):
    return item


@router.post("", response_model=MutationResponse[ProductSchema], status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductCreate,
    service: Annotated[ProductService, Depends(get_product_service)],
):
    return await service.create_product(body)


@router.patch("/{item_id}", response_model=MutationResponse[ProductSchema])
async def update_product(
    body: ProductUpdate,
    item: ProductSchema = Depends(product_by_id),
    service: ProductService = Depends(get_product_service),
):
    return await service.update_product(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_product(
    item_id: int,
    service: Annotated[ProductService, Depends(get_product_service)],
):
    return await service.delete_product(item_id)
