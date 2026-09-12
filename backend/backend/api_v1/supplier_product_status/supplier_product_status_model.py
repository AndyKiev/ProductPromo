from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class SupplierProductStatus(Base):
    __tablename__ = "supplier_product_status"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(16), nullable=False, unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(64), nullable=True)
