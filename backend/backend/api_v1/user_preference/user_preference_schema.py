from pydantic import BaseModel, Field
from backend.api_v1.lang.lang_schema import LangRead


class LanguageUpdate(BaseModel):
    lang_id: int = Field(gt=0)


class UserProfile(BaseModel):
    code: str
    name: str
    lang_id: int
    lang: LangRead
