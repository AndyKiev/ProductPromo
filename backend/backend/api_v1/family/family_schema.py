from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class FamilyBase(BaseModel):
    status_id: int
    category_id: int
    code: str = Field(..., max_length=8)
    name: str = Field(..., max_length=64)


class FamilyCreate(FamilyBase):
    pass


class FamilyUpdate(BaseModel):
    status_id: Optional[int] = None
    category_id: Optional[int] = None
    code: Optional[str] = Field(None, max_length=8)
    name: Optional[str] = Field(None, max_length=64)


class Family(FamilyBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status_name: Optional[str] = None
    category_name: Optional[str] = None
