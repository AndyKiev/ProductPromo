from typing import Optional
from pydantic import BaseModel


class LangSchema(BaseModel):
    id: Optional[int] = None
    short_name: Optional[str] = None
    acronym: Optional[str] = None


class EmployeeSchema(BaseModel):
    """Minimal current-user shape consumed by feature dependencies/i18n.
    Replace with the full ported employee schema when auth is wired."""
    id: int = 1
    name: str = "dev"
    lang_id: Optional[int] = None
    lang_acronym: Optional[str] = "eng"
    lang: Optional[LangSchema] = None
