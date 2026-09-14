from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class UserPreference(Base):
    """Profile settings keyed by the authenticated subject of the existing JWT auth."""
    __tablename__ = "user_preferences"
    code: Mapped[str] = mapped_column("Code", String(128), primary_key=True)
    lang_id: Mapped[int] = mapped_column("LangId", ForeignKey("langs.Id"), index=True)
