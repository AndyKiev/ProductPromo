from pydantic import BaseModel


class CORSConfig(BaseModel):
    origins: list[str] = ["*"]
    credentials: bool = False
    methods: list[str] = ["*"]
    headers: list[str] = ["*"]
