from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base
from backend.api_v1.base.models.utils.mixins_legacy import LegacyCreatedAtMixin, LegacyAuthorMixin


class Nomenclature(LegacyCreatedAtMixin, LegacyAuthorMixin, Base):
    __tablename__ = "nomenclature"   # legacy table; Base auto-plural disabled

    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    market_id: Mapped[int] = mapped_column("IdMarket", ForeignKey("market.Id"))
    segment_id: Mapped[int] = mapped_column("IdSegment", ForeignKey("segment.Id"))
    category_id: Mapped[int] = mapped_column("IdCategory", ForeignKey("category.Id"))
    family_id: Mapped[int] = mapped_column("IdFamily", ForeignKey("family.Id"))

    market = relationship("Market", lazy="joined")
    segment = relationship("Segment", lazy="joined")
    category = relationship("Category", lazy="joined")
    family = relationship("Family", lazy="joined")
