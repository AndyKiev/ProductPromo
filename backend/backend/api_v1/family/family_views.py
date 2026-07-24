from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.family.family_schema import Family as FamilySchema, FamilyCreate, FamilyUpdate
from backend.api_v1.family.family_dependencies import get_family_service, family_by_id
from backend.api_v1.family.family_service import FamilyService

router = APIRouter(
    prefix="/nomenclature/families",
    tags=["Nomenclature"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("", response_model=List[FamilySchema])
async def list_family(
    service: Annotated[FamilyService, Depends(get_family_service)],
    category_id: Optional[int] = None,
    sort: Optional[str] = Query(None),
):
    return await service.list_family(category_id=category_id, sort=sort)


@router.get("/{item_id}", response_model=FamilySchema)
async def get_family(item: FamilySchema = Depends(family_by_id)):
    return item


@router.post("", response_model=MutationResponse[FamilySchema], status_code=status.HTTP_201_CREATED)
async def create_family(
    body: FamilyCreate,
    service: Annotated[FamilyService, Depends(get_family_service)],
):
    return await service.create_family(body)


@router.patch("/{item_id}", response_model=MutationResponse[FamilySchema])
async def update_family(
    body: FamilyUpdate,
    item: FamilySchema = Depends(family_by_id),
    service: FamilyService = Depends(get_family_service),
):
    return await service.update_family(item.id, body)


@router.delete("/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_family(
    item_id: int,
    service: Annotated[FamilyService, Depends(get_family_service)],
):
    return await service.delete_family(item_id)
