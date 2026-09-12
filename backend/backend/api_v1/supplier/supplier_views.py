from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.base.page import Page
from backend.api_v1.supplier.supplier_schema import (
    Supplier as SupplierSchema,
    SupplierCreate,
    SupplierUpdate,
)
from backend.api_v1.supplier.supplier_dependencies import get_supplier_service, supplier_by_id
from backend.api_v1.supplier.supplier_service import SupplierService

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=Page[SupplierSchema])
async def list_suppliers(
    service: Annotated[SupplierService, Depends(get_supplier_service)],
    q: Optional[str] = Query(None),
    status_id: Optional[int] = Query(None),
    page: int = Query(0, ge=0),
    page_size: int = Query(25, ge=1, le=200),
    sort: Optional[str] = Query(None),
    order: str = Query("asc"),
):
    return await service.list_suppliers(
        q=q, status_id=status_id, page=page, page_size=page_size, sort=sort, order=order,
    )


@router.get("/{item_id}", response_model=SupplierSchema)
async def get_supplier(item: SupplierSchema = Depends(supplier_by_id)):
    return item


@router.post("", response_model=MutationResponse[SupplierSchema], status_code=status.HTTP_201_CREATED)
async def create_supplier(
    body: SupplierCreate,
    service: Annotated[SupplierService, Depends(get_supplier_service)],
):
    return await service.create_supplier(body)


@router.patch("/{item_id}", response_model=MutationResponse[SupplierSchema])
async def update_supplier(
    body: SupplierUpdate,
    item: SupplierSchema = Depends(supplier_by_id),
    service: SupplierService = Depends(get_supplier_service),
):
    return await service.update_supplier(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_supplier(
    item_id: int,
    service: Annotated[SupplierService, Depends(get_supplier_service)],
):
    return await service.delete_supplier(item_id)
