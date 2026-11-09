from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

# Codes are text but numeric by contract: ix_*_code_num indexes code::integer, so a
# non-digit or out-of-int4 code would fail inside Postgres instead of as a 422.
CODE_PATTERN = r"^\d{1,9}$"


class SupplierBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=128)
    status_id: Optional[int] = None


class SupplierCreate(SupplierBase):
    code: str = Field(..., max_length=9, pattern=CODE_PATTERN)


class SupplierUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=9, pattern=CODE_PATTERN)
    name: Optional[str] = Field(None, max_length=128)
    status_id: Optional[int] = None


class Supplier(SupplierBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status_name: Optional[str] = None
