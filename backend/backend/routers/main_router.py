from fastapi import APIRouter

from backend.config.config import settings
from backend.auth.jwt_auth import router as auth_router
from backend.api_v1.status_type.status_type_views import router as status_type_router
from backend.api_v1.market.market_views import router as market_router
from backend.api_v1.segment.segment_views import router as segment_router
from backend.api_v1.category.category_views import router as category_router
from backend.api_v1.family.family_views import router as family_router
from backend.api_v1.nomenclature_key.nomenclature_key_views import router as nomenclature_key_router
from backend.api_v1.nomenclature.nomenclature_views import router as nomenclature_router

router = APIRouter(prefix=settings.api_v1_prefix)

router.include_router(auth_router)
router.include_router(status_type_router)
router.include_router(market_router)
router.include_router(segment_router)
router.include_router(category_router)
router.include_router(family_router)
router.include_router(nomenclature_key_router)
router.include_router(nomenclature_router)


@router.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
