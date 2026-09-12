from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaxRateBase(BaseModel):
    tax_type_id: int
    rate: Decimal = Field(..., max_digits=6, decimal_places=2)
    effective_from: date
    effective_till: date


class TaxRateCreate(TaxRateBase):
    pass


class TaxRateUpdate(BaseModel):
    tax_type_id: Optional[int] = None
    rate: Optional[Decimal] = Field(None, max_digits=6, decimal_places=2)
    effective_from: Optional[date] = None
    effective_till: Optional[date] = None


class TaxRate(TaxRateBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    tax_type_code: Optional[str] = None
    tax_type_name: Optional[str] = None
