from sqlalchemy import Boolean, Integer, String, false
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class PromoSubtype(Base):
    __tablename__ = "promo_subtype"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(16), nullable=False, unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    # Legacy promosubtype.ArticleStatusControl: when true, the CUG catalog-status
    # upload check applies (regular = true, plateau = false).
    article_status_control: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=false())
