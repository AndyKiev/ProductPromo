from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.supplier_product_status.supplier_product_status_schema import (
    SupplierProductStatus as SupplierProductStatusSchema,
    SupplierProductStatusCreate,
    SupplierProductStatusUpdate,
)
from backend.api_v1.supplier_product_status.supplier_product_status_dependencies import (
    get_supplier_product_status_service,
    supplier_product_status_by_id,
)
from backend.api_v1.supplier_product_status.supplier_product_status_service import SupplierProductStatusService

router = APIRouter(
    prefix="/supplier-product-statuses",
    tags=["Suppliers"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[SupplierProductStatusSchema])
async def list_supplier_product_statuses(
    service: Annotated[SupplierProductStatusService, Depends(get_supplier_product_status_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_supplier_product_statuses(sort=sort)


@router.get("/{item_id}", response_model=SupplierProductStatusSchema)
async def get_supplier_product_status(item: SupplierProductStatusSchema = Depends(supplier_product_status_by_id)):
    return item


@router.post("", response_model=MutationResponse[SupplierProductStatusSchema], status_code=status.HTTP_201_CREATED)
async def create_supplier_product_status(
    body: SupplierProductStatusCreate,
    service: Annotated[SupplierProductStatusService, Depends(get_supplier_product_status_service)],
):
    return await service.create_supplier_product_status(body)


@router.patch("/{item_id}", response_model=MutationResponse[SupplierProductStatusSchema])
async def update_supplier_product_status(
    body: SupplierProductStatusUpdate,
    item: SupplierProductStatusSchema = Depends(supplier_product_status_by_id),
    service: SupplierProductStatusService = Depends(get_supplier_product_status_service),
):
    return await service.update_supplier_product_status(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_supplier_product_status(
    item_id: int,
    service: Annotated[SupplierProductStatusService, Depends(get_supplier_product_status_service)],
):
    return await service.delete_supplier_product_status(item_id)
