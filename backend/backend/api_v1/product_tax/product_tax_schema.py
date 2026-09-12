from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProductTaxUpdate(BaseModel):
    tax_rate_id: Optional[int] = None


class ProductTax(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    tax_type_id: int
    tax_rate_id: int
    product_code: Optional[str] = None
    product_name: Optional[str] = None
    tax_type_code: Optional[str] = None
    tax_type_name: Optional[str] = None
    rate: Optional[Decimal] = None
