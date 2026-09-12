from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class SupplierBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=128)
    status_id: Optional[int] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=16)
    name: Optional[str] = Field(None, max_length=128)
    status_id: Optional[int] = None


class Supplier(SupplierBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status_name: Optional[str] = None
