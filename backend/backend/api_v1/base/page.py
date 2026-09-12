from typing import Generic, List, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    """Server-pagination envelope for large list endpoints (MUI DataGrid server mode)."""

    items: List[T]
    total: int
