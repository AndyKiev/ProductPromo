from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class PromoTypeBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=128)


class PromoTypeCreate(PromoTypeBase):
    pass


class PromoTypeUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=16)
    name: Optional[str] = Field(None, max_length=128)


class PromoType(PromoTypeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
