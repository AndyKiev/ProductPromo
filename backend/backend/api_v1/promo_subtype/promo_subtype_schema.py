from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class PromoSubtypeBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=128)
    article_status_control: bool = False


class PromoSubtypeCreate(PromoSubtypeBase):
    pass


class PromoSubtypeUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=16)
    name: Optional[str] = Field(None, max_length=128)
    article_status_control: Optional[bool] = None


class PromoSubtype(PromoSubtypeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
