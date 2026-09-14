from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Optional, List

from backend.api_v1.base.mutation_response import MutationResponse
from backend.api_v1.nomenclature_key_link.key_link_schema import (
    KeyLinkCreate, KeyLinkUpdate, KeyLink as KeyLinkSchema,
)
from backend.api_v1.nomenclature_key_link.key_link_dependencies import (
    get_key_link1_service, get_key_link2_service, get_key_link3_service,
    key_link1_by_id, key_link2_by_id, key_link3_by_id,
)
from backend.api_v1.nomenclature_key_link.key_link_service import KeyLinkService

from backend.api_v1.nomenclature_key_link.nom_key_link_status_type_model import NomKeyLinkStatusType
from backend.database.db_helper import db_helper
from backend.auth.jwt_auth import get_current_active_auth_user
from backend.api_v1.employee.employee_schema import EmployeeSchema
from backend.api_v1.base.i18n import localized_name, lang_suffix_for

router = APIRouter(
    prefix="/nomenclature/key-links",
    tags=["Nomenclature — Key Links"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)


@router.get("/status-types", response_model=List[dict])
async def list_key_link_status_types(session: AsyncSession = Depends(db_helper.session_getter),
                                     user: EmployeeSchema = Depends(get_current_active_auth_user)):
    from sqlalchemy import select
    rows = (await session.execute(select(NomKeyLinkStatusType))).scalars().all()
    return [{"id": r.id, "name": localized_name(r, lang_suffix_for(user)),
             "name_u": r.name_u, "name_e": r.name_e} for r in rows]


def _parent_param(parent_id: Optional[int] = Query(None, description="Filter by parent ID")):
    return parent_id


# ── Level 1 ──────────────────────────────────────────────────────────────
@router.get("/1", response_model=List[KeyLinkSchema])
async def list_key_links1(
    service: Annotated[KeyLinkService, Depends(get_key_link1_service)],
    parent_id: Optional[int] = Query(None),
):
    return await service.list_key_links(parent_id=parent_id)


@router.get("/1/{item_id}", response_model=KeyLinkSchema)
async def get_key_link1(item: KeyLinkSchema = Depends(key_link1_by_id)):
    return item


@router.post("/1", response_model=MutationResponse[KeyLinkSchema], status_code=status.HTTP_201_CREATED)
async def create_key_link1(
    body: KeyLinkCreate,
    service: Annotated[KeyLinkService, Depends(get_key_link1_service)],
):
    return await service.create_key_link(body)


@router.patch("/1/{item_id}", response_model=MutationResponse[KeyLinkSchema])
async def update_key_link1(
    body: KeyLinkUpdate,
    item: KeyLinkSchema = Depends(key_link1_by_id),
    service: KeyLinkService = Depends(get_key_link1_service),
):
    return await service.update_key_link(item.id, body)


@router.delete("/1/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_key_link1(
    item_id: int,
    service: Annotated[KeyLinkService, Depends(get_key_link1_service)],
):
    return await service.delete_key_link(item_id)


# ── Level 2 ──────────────────────────────────────────────────────────────
@router.get("/2", response_model=List[KeyLinkSchema])
async def list_key_links2(
    service: Annotated[KeyLinkService, Depends(get_key_link2_service)],
    parent_id: Optional[int] = Query(None, description="Filter by level 1 parent ID"),
):
    return await service.list_key_links(parent_id=parent_id)


@router.get("/2/{item_id}", response_model=KeyLinkSchema)
async def get_key_link2(item: KeyLinkSchema = Depends(key_link2_by_id)):
    return item


@router.post("/2", response_model=MutationResponse[KeyLinkSchema], status_code=status.HTTP_201_CREATED)
async def create_key_link2(
    body: KeyLinkCreate,
    service: Annotated[KeyLinkService, Depends(get_key_link2_service)],
):
    return await service.create_key_link(body)


@router.patch("/2/{item_id}", response_model=MutationResponse[KeyLinkSchema])
async def update_key_link2(
    body: KeyLinkUpdate,
    item: KeyLinkSchema = Depends(key_link2_by_id),
    service: KeyLinkService = Depends(get_key_link2_service),
):
    return await service.update_key_link(item.id, body)


@router.delete("/2/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_key_link2(
    item_id: int,
    service: Annotated[KeyLinkService, Depends(get_key_link2_service)],
):
    return await service.delete_key_link(item_id)


# ── Level 3 ──────────────────────────────────────────────────────────────
@router.get("/3", response_model=List[KeyLinkSchema])
async def list_key_links3(
    service: Annotated[KeyLinkService, Depends(get_key_link3_service)],
    parent_id: Optional[int] = Query(None, description="Filter by level 2 parent ID"),
):
    return await service.list_key_links(parent_id=parent_id)


@router.get("/3/{item_id}", response_model=KeyLinkSchema)
async def get_key_link3(item: KeyLinkSchema = Depends(key_link3_by_id)):
    return item


@router.post("/3", response_model=MutationResponse[KeyLinkSchema], status_code=status.HTTP_201_CREATED)
async def create_key_link3(
    body: KeyLinkCreate,
    service: Annotated[KeyLinkService, Depends(get_key_link3_service)],
):
    return await service.create_key_link(body)


@router.patch("/3/{item_id}", response_model=MutationResponse[KeyLinkSchema])
async def update_key_link3(
    body: KeyLinkUpdate,
    item: KeyLinkSchema = Depends(key_link3_by_id),
    service: KeyLinkService = Depends(get_key_link3_service),
):
    return await service.update_key_link(item.id, body)


@router.delete("/3/{item_id}", response_model=MutationResponse[None], status_code=status.HTTP_200_OK)
async def delete_key_link3(
    item_id: int,
    service: Annotated[KeyLinkService, Depends(get_key_link3_service)],
):
    return await service.delete_key_link(item_id)
