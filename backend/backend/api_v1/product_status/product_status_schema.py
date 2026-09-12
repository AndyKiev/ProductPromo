from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class ProductStatusBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=64)


class ProductStatusCreate(ProductStatusBase):
    pass


class ProductStatusUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=16)
    name: Optional[str] = Field(None, max_length=64)


class ProductStatus(ProductStatusBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
