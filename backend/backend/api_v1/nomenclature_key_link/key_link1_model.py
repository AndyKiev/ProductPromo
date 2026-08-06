from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base
from backend.api_v1.base.models.utils.mixins_legacy import LegacyCreatedAtMixin


class NomenclatureKeyLink1(LegacyCreatedAtMixin, Base):
    __tablename__ = "nomenclaturekeylink1"

    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    status_id: Mapped[int] = mapped_column("IdStatus", ForeignKey("nomkeylinkstatustype.Id"))
    parent_id: Mapped[int] = mapped_column("IdParent", ForeignKey("family.Id"))
    key_id: Mapped[int] = mapped_column("IdKey", ForeignKey("nomenclaturekey.Id"))

    status = relationship("NomKeyLinkStatusType", lazy="joined")
    parent = relationship("Family", lazy="joined")
    key = relationship("NomenclatureKey", lazy="joined")
    children = relationship("NomenclatureKeyLink2", back_populates="parent", lazy="selectin", cascade="all, delete-orphan")
