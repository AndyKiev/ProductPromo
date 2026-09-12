from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class Ean(Base):
    __tablename__ = "ean"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("product.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ean: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
