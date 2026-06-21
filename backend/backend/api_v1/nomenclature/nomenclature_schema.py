from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class NomenclatureBase(BaseModel):
    market_id: int
    segment_id: int
    category_id: int
    family_id: int


class NomenclatureCreate(NomenclatureBase):
    pass


class NomenclatureUpdate(BaseModel):
    market_id: Optional[int] = None
    segment_id: Optional[int] = None
    category_id: Optional[int] = None
    family_id: Optional[int] = None


class Nomenclature(NomenclatureBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    market_name: Optional[str] = None
    segment_name: Optional[str] = None
    category_name: Optional[str] = None
    family_name: Optional[str] = None
