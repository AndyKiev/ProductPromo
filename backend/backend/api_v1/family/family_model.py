from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class Family(Base):
    __tablename__ = "family"   # legacy table; Base auto-plural disabled

    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    status_id: Mapped[int] = mapped_column("IdStatus", ForeignKey("statustype.Id"))
    category_id: Mapped[int] = mapped_column("IdCategory", ForeignKey("category.Id"))
    code: Mapped[str] = mapped_column("FamilyCode", String(8), nullable=False)
    name: Mapped[str] = mapped_column("FamilyName", String(64), nullable=False)

    status = relationship("StatusType", lazy="joined")
    category = relationship("Category", lazy="joined")
