from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class MarketBase(BaseModel):
    name: str = Field(..., max_length=128)


class MarketCreate(MarketBase):
    pass


class MarketUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=128)


class Market(MarketBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
