from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

from backend.config.config import settings

# `x-lookup` names the collection a field points to; the frontend renders it as a select.
TYPE_LOOKUP = {"x-lookup": f"{settings.api_v1_prefix}/promo-types"}
SUBTYPE_LOOKUP = {"x-lookup": f"{settings.api_v1_prefix}/promo-subtypes"}


class PromoTypeSubtypeCreate(BaseModel):
    promo_type_id: int = Field(..., json_schema_extra=TYPE_LOOKUP)
    promo_subtype_id: int = Field(..., json_schema_extra=SUBTYPE_LOOKUP)


class PromoTypeSubtypeUpdate(BaseModel):
    promo_type_id: Optional[int] = Field(None, json_schema_extra=TYPE_LOOKUP)
    promo_subtype_id: Optional[int] = Field(None, json_schema_extra=SUBTYPE_LOOKUP)


class PromoTypeSubtype(PromoTypeSubtypeCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
