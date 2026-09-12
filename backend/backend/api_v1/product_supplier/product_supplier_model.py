from sqlalchemy import Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class ProductSupplier(Base):
    """Association: one product offered by one supplier, with the supplier-product status."""

    __tablename__ = "product_supplier"
    __table_args__ = (UniqueConstraint("product_id", "supplier_id", name="uq_product_supplier"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("product.id"), nullable=False, index=True)
    supplier_id: Mapped[int] = mapped_column(Integer, ForeignKey("supplier.id"), nullable=False, index=True)
    status_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("supplier_product_status.id"), nullable=True, index=True
    )

    product = relationship("Product", lazy="joined")
    supplier = relationship("Supplier", lazy="joined")
    status = relationship("SupplierProductStatus", lazy="joined")
