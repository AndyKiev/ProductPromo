from sqlalchemy import Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class ProductTax(Base):
    """Tax applied to a product (one row per tax type: VAT, and Excise when applicable)."""

    __tablename__ = "product_tax"
    __table_args__ = (UniqueConstraint("product_id", "tax_type_id", name="uq_product_tax"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("product.id"), nullable=False, index=True)
    tax_type_id: Mapped[int] = mapped_column(Integer, ForeignKey("tax_type.id"), nullable=False, index=True)
    tax_rate_id: Mapped[int] = mapped_column(Integer, ForeignKey("tax_rate.id"), nullable=False, index=True)

    product = relationship("Product", lazy="joined")
    tax_type = relationship("TaxType", lazy="joined")
    tax_rate = relationship("TaxRate", lazy="joined")
