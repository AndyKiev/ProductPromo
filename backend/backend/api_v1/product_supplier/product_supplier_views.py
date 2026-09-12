from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.page import Page
from backend.api_v1.product_supplier.product_supplier_schema import (
    ProductSupplier as ProductSupplierSchema,
    ProductSupplierUpdate,
)
from backend.api_v1.product_supplier.product_supplier_dependencies import (
    get_product_supplier_service,
    product_supplier_by_id,
)
from backend.api_v1.product_supplier.product_supplier_service import ProductSupplierService

router = APIRouter(
    prefix="/product-suppliers",
    tags=["Products"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=Page[ProductSupplierSchema])
async def list_product_suppliers(
    service: Annotated[ProductSupplierService, Depends(get_product_supplier_service)],
    q: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    supplier_id: Optional[int] = Query(None),
    status_id: Optional[int] = Query(None),
    page: int = Query(0, ge=0),
    page_size: int = Query(25, ge=1, le=200),
    sort: Optional[str] = Query(None),
    order: str = Query("asc"),
):
    return await service.list_links(
        q=q, product_id=product_id, supplier_id=supplier_id, status_id=status_id,
        page=page, page_size=page_size, sort=sort, order=order,
    )


@router.get("/{item_id}", response_model=ProductSupplierSchema)
async def get_product_supplier(item: ProductSupplierSchema = Depends(product_supplier_by_id)):
    return item


@router.patch("/{item_id}", response_model=MutationResponse[ProductSupplierSchema])
async def update_product_supplier(
    body: ProductSupplierUpdate,
    item: ProductSupplierSchema = Depends(product_supplier_by_id),
    service: ProductSupplierService = Depends(get_product_supplier_service),
):
    return await service.update_link(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_product_supplier(
    item_id: int,
    service: Annotated[ProductSupplierService, Depends(get_product_supplier_service)],
):
    return await service.delete_link(item_id)
