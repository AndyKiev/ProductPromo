from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class NomKeyLinkStatusType(Base):
    __tablename__ = "nomkeylinkstatustype"

    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    name_r: Mapped[str] = mapped_column("NameR", String(64), nullable=False)
    name_u: Mapped[str] = mapped_column("NameU", String(64), nullable=False)
    name_e: Mapped[str] = mapped_column("NameE", String(64), nullable=False)
    name_f: Mapped[str] = mapped_column("NameF", String(64), nullable=False)
