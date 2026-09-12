from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class SupplierStatusBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=64)


class SupplierStatusCreate(SupplierStatusBase):
    pass


class SupplierStatusUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=16)
    name: Optional[str] = Field(None, max_length=64)


class SupplierStatus(SupplierStatusBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
