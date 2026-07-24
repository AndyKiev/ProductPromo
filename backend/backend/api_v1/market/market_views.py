from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.market.market_schema import Market as MarketSchema, MarketCreate, MarketUpdate
from backend.api_v1.market.market_dependencies import get_market_service, market_by_id
from backend.api_v1.market.market_service import MarketService

router = APIRouter(
    prefix="/nomenclature/markets",
    tags=["Nomenclature"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[MarketSchema])
async def list_market(
    service: Annotated[MarketService, Depends(get_market_service)],
    sort: Optional[str] = Query(None),
):
    return await service.list_market(sort=sort)


@router.get("/{item_id}", response_model=MarketSchema)
async def get_market(item: MarketSchema = Depends(market_by_id)):
    return item


@router.post("", response_model=MutationResponse[MarketSchema], status_code=status.HTTP_201_CREATED)
async def create_market(
    body: MarketCreate,
    service: Annotated[MarketService, Depends(get_market_service)],
):
    return await service.create_market(body)


@router.patch("/{item_id}", response_model=MutationResponse[MarketSchema])
async def update_market(
    body: MarketUpdate,
    item: MarketSchema = Depends(market_by_id),
    service: MarketService = Depends(get_market_service),
):
    return await service.update_market(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_market(
    item_id: int,
    service: Annotated[MarketService, Depends(get_market_service)],
):
    return await service.delete_market(item_id)
