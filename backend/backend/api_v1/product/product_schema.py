from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

# Codes are text but numeric by contract: ix_*_code_num indexes code::integer, so a
# non-digit or out-of-int4 code would fail inside Postgres instead of as a 422.
CODE_PATTERN = r"^\d{1,9}$"


class ProductBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=128)
    nomenclature_id: Optional[int] = None
    status_id: Optional[int] = None
    import_code_id: Optional[int] = None
    product_type_id: Optional[int] = None


class ProductCreate(ProductBase):
    code: str = Field(..., max_length=9, pattern=CODE_PATTERN)


class ProductUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=9, pattern=CODE_PATTERN)
    name: Optional[str] = Field(None, max_length=128)
    nomenclature_id: Optional[int] = None
    status_id: Optional[int] = None
    import_code_id: Optional[int] = None
    product_type_id: Optional[int] = None


class Product(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    market_name: Optional[str] = None
    segment_name: Optional[str] = None
    category_name: Optional[str] = None
    family_name: Optional[str] = None
    status_name: Optional[str] = None
    import_code: Optional[str] = None
    import_code_description: Optional[str] = None
    product_type_code: Optional[str] = None
    product_type_name: Optional[str] = None
