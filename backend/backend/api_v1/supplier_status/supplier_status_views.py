from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.supplier_status.supplier_status_schema import (
    SupplierStatus as SupplierStatusSchema,
    SupplierStatusCreate,
    SupplierStatusUpdate,
)
from backend.api_v1.supplier_status.supplier_status_dependencies import (
    get_supplier_status_service,
    supplier_status_by_id,
)
from backend.api_v1.supplier_status.supplier_status_service import SupplierStatusService

router = APIRouter(
    prefix="/supplier-statuses",
    tags=["Suppliers"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[SupplierStatusSchema])
async def list_supplier_statuses(
    service: Annotated[SupplierStatusService, Depends(get_supplier_status_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_supplier_statuses(sort=sort)


@router.get("/{item_id}", response_model=SupplierStatusSchema)
async def get_supplier_status(item: SupplierStatusSchema = Depends(supplier_status_by_id)):
    return item


@router.post("", response_model=MutationResponse[SupplierStatusSchema], status_code=status.HTTP_201_CREATED)
async def create_supplier_status(
    body: SupplierStatusCreate,
    service: Annotated[SupplierStatusService, Depends(get_supplier_status_service)],
):
    return await service.create_supplier_status(body)


@router.patch("/{item_id}", response_model=MutationResponse[SupplierStatusSchema])
async def update_supplier_status(
    body: SupplierStatusUpdate,
    item: SupplierStatusSchema = Depends(supplier_status_by_id),
    service: SupplierStatusService = Depends(get_supplier_status_service),
):
    return await service.update_supplier_status(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_supplier_status(
    item_id: int,
    service: Annotated[SupplierStatusService, Depends(get_supplier_status_service)],
):
    return await service.delete_supplier_status(item_id)
