from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class CategoryBase(BaseModel):
    status_id: int
    segment_id: int
    code: str = Field(..., max_length=8)
    name: str = Field(..., max_length=64)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    status_id: Optional[int] = None
    segment_id: Optional[int] = None
    code: Optional[str] = Field(None, max_length=8)
    name: Optional[str] = Field(None, max_length=64)


class Category(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status_name: Optional[str] = None
    segment_name: Optional[str] = None
