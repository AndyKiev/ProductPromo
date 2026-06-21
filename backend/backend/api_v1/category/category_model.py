from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class Category(Base):
    __tablename__ = "category"   # legacy table; Base auto-plural disabled

    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    status_id: Mapped[int] = mapped_column("IdStatus", ForeignKey("statustype.Id"))
    segment_id: Mapped[int] = mapped_column("IdSegment", ForeignKey("segment.Id"))
    code: Mapped[str] = mapped_column("CategoryCode", String(8), nullable=False)
    name: Mapped[str] = mapped_column("CategoryName", String(64), nullable=False)

    status = relationship("StatusType", lazy="joined")
    segment = relationship("Segment", lazy="joined")
