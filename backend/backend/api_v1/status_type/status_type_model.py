from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class StatusType(Base):
    __tablename__ = "statustype"   # legacy reference table; read-only

    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    code: Mapped[str] = mapped_column("StatusTypeName", String(64), nullable=True)
    # We keep only ukr/eng of NameR/NameU/NameE/NameF
    name_u: Mapped[str] = mapped_column("NameU", String(64), nullable=True)
    name_e: Mapped[str] = mapped_column("NameE", String(64), nullable=True)
