from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class Lang(Base):
    __tablename__ = "langs"
    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    short_name: Mapped[str] = mapped_column("ShortName", String(8), unique=True)
    name: Mapped[str] = mapped_column("Name", String(64))
    locale: Mapped[str] = mapped_column("Locale", String(16), unique=True)
