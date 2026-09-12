from datetime import date
from decimal import Decimal

from sqlalchemy import Integer, Numeric, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class TaxRate(Base):
    """A tax type's rate effective over a date window (for example 01.01.2000–01.12.2050)."""

    __tablename__ = "tax_rate"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tax_type_id: Mapped[int] = mapped_column(Integer, ForeignKey("tax_type.id"), nullable=False, index=True)
    rate: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_till: Mapped[date] = mapped_column(Date, nullable=False)

    tax_type = relationship("TaxType", lazy="joined")
