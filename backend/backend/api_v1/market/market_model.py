from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class Market(Base):
    __tablename__ = "market"   # legacy table; Base auto-plural disabled

    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    name: Mapped[str] = mapped_column("MarketName", String(128), nullable=False)
