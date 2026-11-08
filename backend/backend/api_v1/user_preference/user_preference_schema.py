from pydantic import BaseModel, Field
from pp_common.i18n import LangRead


class LanguageUpdate(BaseModel):
    lang_id: int = Field(gt=0)


class UserProfile(BaseModel):
    code: str
    name: str
    lang_id: int
    lang: LangRead
