from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class Supplier(Base):
    __tablename__ = "supplier"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(16), nullable=False, unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("supplier_status.id"), nullable=True, index=True)

    status = relationship("SupplierStatus", lazy="joined")
