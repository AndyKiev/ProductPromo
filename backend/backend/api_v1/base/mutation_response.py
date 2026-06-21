from typing import Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class MutationResponse(BaseModel, Generic[T]):
    detail: str
    data: Optional[T] = None
