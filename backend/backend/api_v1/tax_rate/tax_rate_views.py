from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.tax_rate.tax_rate_schema import (
    TaxRate as TaxRateSchema,
    TaxRateCreate,
    TaxRateUpdate,
)
from backend.api_v1.tax_rate.tax_rate_dependencies import get_tax_rate_service, tax_rate_by_id
from backend.api_v1.tax_rate.tax_rate_service import TaxRateService

router = APIRouter(
    prefix="/tax-rates",
    tags=["Taxes"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[TaxRateSchema])
async def list_tax_rates(
    service: Annotated[TaxRateService, Depends(get_tax_rate_service)],
    tax_type_id: Optional[int] = Query(None),
    sort: Optional[str] = Query(None),
):
    return await service.list_tax_rates(tax_type_id=tax_type_id, sort=sort)


@router.get("/{item_id}", response_model=TaxRateSchema)
async def get_tax_rate(item: TaxRateSchema = Depends(tax_rate_by_id)):
    return item


@router.post("", response_model=MutationResponse[TaxRateSchema], status_code=status.HTTP_201_CREATED)
async def create_tax_rate(
    body: TaxRateCreate,
    service: Annotated[TaxRateService, Depends(get_tax_rate_service)],
):
    return await service.create_tax_rate(body)


@router.patch("/{item_id}", response_model=MutationResponse[TaxRateSchema])
async def update_tax_rate(
    body: TaxRateUpdate,
    item: TaxRateSchema = Depends(tax_rate_by_id),
    service: TaxRateService = Depends(get_tax_rate_service),
):
    return await service.update_tax_rate(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_tax_rate(
    item_id: int,
    service: Annotated[TaxRateService, Depends(get_tax_rate_service)],
):
    return await service.delete_tax_rate(item_id)
