from typing import Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class MutationResponse(BaseModel, Generic[T]):
    detail: str
    data: Optional[T] = None
    message_key: str | None = None
    params: dict = Field(default_factory=dict)
    lang_id: int | None = None
