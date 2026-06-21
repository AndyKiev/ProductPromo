from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base
from backend.api_v1.base.models.utils.mixins_legacy import LegacyCreatedAtMixin


class NomenclatureKey(LegacyCreatedAtMixin, Base):
    __tablename__ = "nomenclaturekey"   # legacy table; Base auto-plural disabled

    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    name: Mapped[str] = mapped_column("KeyName", String(64), nullable=False)
