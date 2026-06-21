from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class NomenclatureKeyBase(BaseModel):
    name: str = Field(..., max_length=64)


class NomenclatureKeyCreate(NomenclatureKeyBase):
    pass


class NomenclatureKeyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=64)


class NomenclatureKey(NomenclatureKeyBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
