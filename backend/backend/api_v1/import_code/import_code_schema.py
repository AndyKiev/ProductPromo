from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class ImportCodeBase(BaseModel):
    code: str = Field(..., max_length=20)
    description: Optional[str] = Field(None, max_length=255)


class ImportCodeCreate(ImportCodeBase):
    pass


class ImportCodeUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=255)


class ImportCode(ImportCodeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
