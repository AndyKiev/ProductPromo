from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class UserPreference(Base):
    """Language of a signed-in employee IN THIS APP, keyed by the matricule
    (shape expected by pp_common.auth.build_profile: `employee_code`, `lang_id`)."""
    __tablename__ = "user_preferences"
    employee_code: Mapped[str] = mapped_column("Code", String(128), primary_key=True)
    lang_id: Mapped[int] = mapped_column("LangId", ForeignKey("langs.Id"), index=True)
