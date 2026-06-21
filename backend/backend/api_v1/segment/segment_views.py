from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.segment.segment_schema import Segment as SegmentSchema, SegmentCreate, SegmentUpdate
from backend.api_v1.segment.segment_dependencies import get_segment_service, segment_by_id
from backend.api_v1.segment.segment_service import SegmentService

router = APIRouter(
    prefix="/nomenclature/segments",
    tags=["Nomenclature"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[SegmentSchema])
async def list_segment(
    service: Annotated[SegmentService, Depends(get_segment_service)],
    market_id: Optional[int] = None,
    sort: Optional[str] = Query(None),
):
    return await service.list_segment(market_id=market_id, sort=sort)


@router.get("/{item_id}", response_model=SegmentSchema)
async def get_segment(item: SegmentSchema = Depends(segment_by_id)):
    return item


@router.post("", response_model=MutationResponse[SegmentSchema], status_code=status.HTTP_201_CREATED)
async def create_segment(
    body: SegmentCreate,
    service: Annotated[SegmentService, Depends(get_segment_service)],
):
    return await service.create_segment(body)


@router.patch("/{item_id}", response_model=MutationResponse[SegmentSchema])
async def update_segment(
    body: SegmentUpdate,
    item: SegmentSchema = Depends(segment_by_id),
    service: SegmentService = Depends(get_segment_service),
):
    return await service.update_segment(item.id, body)


@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
async def delete_segment(
    item_id: int,
    service: Annotated[SegmentService, Depends(get_segment_service)],
):
    await service.delete_segment(item_id)
