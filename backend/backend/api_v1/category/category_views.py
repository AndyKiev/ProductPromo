from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.category.category_schema import Category as CategorySchema, CategoryCreate, CategoryUpdate
from backend.api_v1.category.category_dependencies import get_category_service, category_by_id
from backend.api_v1.category.category_service import CategoryService

router = APIRouter(
    prefix="/nomenclature/categories",
    tags=["Nomenclature"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[CategorySchema])
async def list_category(
    service: Annotated[CategoryService, Depends(get_category_service)],
    segment_id: Optional[int] = None,
    sort: Optional[str] = Query(None),
):
    return await service.list_category(segment_id=segment_id, sort=sort)


@router.get("/{item_id}", response_model=CategorySchema)
async def get_category(item: CategorySchema = Depends(category_by_id)):
    return item


@router.post("", response_model=MutationResponse[CategorySchema], status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryCreate,
    service: Annotated[CategoryService, Depends(get_category_service)],
):
    return await service.create_category(body)


@router.patch("/{item_id}", response_model=MutationResponse[CategorySchema])
async def update_category(
    body: CategoryUpdate,
    item: CategorySchema = Depends(category_by_id),
    service: CategoryService = Depends(get_category_service),
):
    return await service.update_category(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_category(
    item_id: int,
    service: Annotated[CategoryService, Depends(get_category_service)],
):
    return await service.delete_category(item_id)
