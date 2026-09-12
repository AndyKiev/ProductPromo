from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class ImportCode(Base):
    __tablename__ = "import_code"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
