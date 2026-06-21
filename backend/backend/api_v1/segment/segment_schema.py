from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class SegmentBase(BaseModel):
    status_id: int
    market_id: int
    code: str = Field(..., max_length=8)
    name: str = Field(..., max_length=64)


class SegmentCreate(SegmentBase):
    pass


class SegmentUpdate(BaseModel):
    status_id: Optional[int] = None
    market_id: Optional[int] = None
    code: Optional[str] = Field(None, max_length=8)
    name: Optional[str] = Field(None, max_length=64)


class Segment(SegmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status_name: Optional[str] = None
    market_name: Optional[str] = None
