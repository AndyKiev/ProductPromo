from pydantic import BaseModel, ConfigDict
from typing import Optional


class ProductSupplierUpdate(BaseModel):
    status_id: Optional[int] = None


class ProductSupplier(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    supplier_id: int
    status_id: Optional[int] = None
    product_code: Optional[str] = None
    product_name: Optional[str] = None
    supplier_code: Optional[str] = None
    supplier_name: Optional[str] = None
    status_name: Optional[str] = None
