from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class ProductTypeBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=128)


class ProductTypeCreate(ProductTypeBase):
    pass


class ProductTypeUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=16)
    name: Optional[str] = Field(None, max_length=128)


class ProductType(ProductTypeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
