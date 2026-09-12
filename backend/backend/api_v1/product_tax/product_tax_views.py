from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.page import Page
from backend.api_v1.product_tax.product_tax_schema import (
    ProductTax as ProductTaxSchema,
    ProductTaxUpdate,
)
from backend.api_v1.product_tax.product_tax_dependencies import (
    get_product_tax_service,
    product_tax_by_id,
)
from backend.api_v1.product_tax.product_tax_service import ProductTaxService

router = APIRouter(
    prefix="/product-taxes",
    tags=["Taxes"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=Page[ProductTaxSchema])
async def list_product_taxes(
    service: Annotated[ProductTaxService, Depends(get_product_tax_service)],
    q: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    tax_type_id: Optional[int] = Query(None),
    page: int = Query(0, ge=0),
    page_size: int = Query(25, ge=1, le=200),
    sort: Optional[str] = Query(None),
    order: str = Query("asc"),
):
    return await service.list_product_taxes(
        q=q, product_id=product_id, tax_type_id=tax_type_id,
        page=page, page_size=page_size, sort=sort, order=order,
    )


@router.get("/{item_id}", response_model=ProductTaxSchema)
async def get_product_tax(item: ProductTaxSchema = Depends(product_tax_by_id)):
    return item


@router.patch("/{item_id}", response_model=MutationResponse[ProductTaxSchema])
async def update_product_tax(
    body: ProductTaxUpdate,
    item: ProductTaxSchema = Depends(product_tax_by_id),
    service: ProductTaxService = Depends(get_product_tax_service),
):
    return await service.update_product_tax(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_product_tax(
    item_id: int,
    service: Annotated[ProductTaxService, Depends(get_product_tax_service)],
):
    return await service.delete_product_tax(item_id)
