from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class TaxTypeBase(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=64)


class TaxTypeCreate(TaxTypeBase):
    pass


class TaxTypeUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=16)
    name: Optional[str] = Field(None, max_length=64)


class TaxType(TaxTypeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
