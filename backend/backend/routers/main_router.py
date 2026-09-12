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
from backend.api_v1.nomenclature_key_link.key_link_views import router as key_link_router
from backend.api_v1.product_status.product_status_views import router as product_status_router
from backend.api_v1.supplier_status.supplier_status_views import router as supplier_status_router
from backend.api_v1.supplier_product_status.supplier_product_status_views import router as supplier_product_status_router
from backend.api_v1.import_code.import_code_views import router as import_code_router
from backend.api_v1.product.product_views import router as product_router
from backend.api_v1.product_type.product_type_views import router as product_type_router
from backend.api_v1.ean.ean_views import router as ean_router
from backend.api_v1.supplier.supplier_views import router as supplier_router
from backend.api_v1.product_supplier.product_supplier_views import router as product_supplier_router
from backend.api_v1.tax_type.tax_type_views import router as tax_type_router
from backend.api_v1.tax_rate.tax_rate_views import router as tax_rate_router
from backend.api_v1.product_tax.product_tax_views import router as product_tax_router

router = APIRouter(prefix=settings.api_v1_prefix)

router.include_router(auth_router)
router.include_router(status_type_router)
router.include_router(market_router)
router.include_router(segment_router)
router.include_router(category_router)
router.include_router(family_router)
router.include_router(nomenclature_key_router)
router.include_router(nomenclature_router)
router.include_router(key_link_router)
router.include_router(product_status_router)
router.include_router(supplier_status_router)
router.include_router(supplier_product_status_router)
router.include_router(import_code_router)
router.include_router(product_router)
router.include_router(product_type_router)
router.include_router(ean_router)
router.include_router(supplier_router)
router.include_router(product_supplier_router)
router.include_router(tax_type_router)
router.include_router(tax_rate_router)
router.include_router(product_tax_router)


@router.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
