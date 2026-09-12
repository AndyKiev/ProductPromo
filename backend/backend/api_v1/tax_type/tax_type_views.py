from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.tax_type.tax_type_schema import (
    TaxType as TaxTypeSchema,
    TaxTypeCreate,
    TaxTypeUpdate,
)
from backend.api_v1.tax_type.tax_type_dependencies import get_tax_type_service, tax_type_by_id
from backend.api_v1.tax_type.tax_type_service import TaxTypeService

router = APIRouter(
    prefix="/tax-types",
    tags=["Taxes"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[TaxTypeSchema])
async def list_tax_types(
    service: Annotated[TaxTypeService, Depends(get_tax_type_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_tax_types(sort=sort)


@router.get("/{item_id}", response_model=TaxTypeSchema)
async def get_tax_type(item: TaxTypeSchema = Depends(tax_type_by_id)):
    return item


@router.post("", response_model=MutationResponse[TaxTypeSchema], status_code=status.HTTP_201_CREATED)
async def create_tax_type(
    body: TaxTypeCreate,
    service: Annotated[TaxTypeService, Depends(get_tax_type_service)],
):
    return await service.create_tax_type(body)


@router.patch("/{item_id}", response_model=MutationResponse[TaxTypeSchema])
async def update_tax_type(
    body: TaxTypeUpdate,
    item: TaxTypeSchema = Depends(tax_type_by_id),
    service: TaxTypeService = Depends(get_tax_type_service),
):
    return await service.update_tax_type(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_tax_type(
    item_id: int,
    service: Annotated[TaxTypeService, Depends(get_tax_type_service)],
):
    return await service.delete_tax_type(item_id)
