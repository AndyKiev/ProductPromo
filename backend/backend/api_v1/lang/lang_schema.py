from pydantic import BaseModel, ConfigDict


class LangRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    short_name: str
    name: str
    locale: str
