from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class SupplierProductStatusBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=64)


class SupplierProductStatusCreate(SupplierProductStatusBase):
    pass


class SupplierProductStatusUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=16)
    name: Optional[str] = Field(None, max_length=64)


class SupplierProductStatus(SupplierProductStatusBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
