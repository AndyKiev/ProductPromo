from sqlalchemy import Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class PromoTypeSubtype(Base):
    """Which subtypes a promo type allows (legacy aula.promotypesubtype)."""

    __tablename__ = "promo_type_subtype"
    __table_args__ = (UniqueConstraint("promo_type_id", "promo_subtype_id", name="uq_promo_type_subtype"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    promo_type_id: Mapped[int] = mapped_column(Integer, ForeignKey("promo_type.id"), nullable=False, index=True)
    promo_subtype_id: Mapped[int] = mapped_column(Integer, ForeignKey("promo_subtype.id"), nullable=False, index=True)

    promo_type = relationship("PromoType", lazy="joined")
    promo_subtype = relationship("PromoSubtype", lazy="joined")
