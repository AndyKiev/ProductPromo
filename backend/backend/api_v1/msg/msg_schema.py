from pydantic import BaseModel


class MessageBundle(BaseModel):
    lang_id: int
    version: str
    messages: dict[str, str]
