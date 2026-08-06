from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class KeyLinkBase(BaseModel):
    status_id: int
    parent_id: int
    key_id: int


class KeyLinkCreate(KeyLinkBase):
    pass


class KeyLinkUpdate(BaseModel):
    status_id: Optional[int] = None
    key_id: Optional[int] = None


class KeyLink(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status_id: int
    parent_id: int
    key_id: int
    created_at: Optional[datetime] = None
    status_name: Optional[str] = None
    key_name: Optional[str] = None
    parent_name: Optional[str] = None
