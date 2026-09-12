from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class EanBase(BaseModel):
    product_id: int
    ean: str = Field(..., max_length=32)


class EanCreate(EanBase):
    pass


class EanUpdate(BaseModel):
    product_id: Optional[int] = None
    ean: Optional[str] = Field(None, max_length=32)


class Ean(EanBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
