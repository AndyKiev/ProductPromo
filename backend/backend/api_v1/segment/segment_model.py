from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class Segment(Base):
    __tablename__ = "segment"   # legacy table; Base auto-plural disabled

    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    status_id: Mapped[int] = mapped_column("IdStatus", ForeignKey("statustype.Id"))
    market_id: Mapped[int] = mapped_column("IdMarket", ForeignKey("market.Id"))
    code: Mapped[str] = mapped_column("segment", String(8), nullable=False)
    name: Mapped[str] = mapped_column("SegmentName", String(64), nullable=False)

    status = relationship("StatusType", lazy="joined")
    market = relationship("Market", lazy="joined")
