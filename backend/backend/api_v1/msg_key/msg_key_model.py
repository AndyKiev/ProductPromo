from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class MsgKey(Base):
    __tablename__ = "msg_keys"
    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    name: Mapped[str] = mapped_column("Name", String(160), unique=True)
    fallback: Mapped[str] = mapped_column("Fallback", Text)
