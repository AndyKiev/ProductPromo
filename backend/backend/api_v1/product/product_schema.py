from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class ProductBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=128)
    nomenclature_id: Optional[int] = None
    status_id: Optional[int] = None
    import_code_id: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=16)
    name: Optional[str] = Field(None, max_length=128)
    nomenclature_id: Optional[int] = None
    status_id: Optional[int] = None
    import_code_id: Optional[int] = None


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
