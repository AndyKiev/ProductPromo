from sqlalchemy import Integer, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from backend.api_v1.base.base_model import Base


class Msg(Base):
    __tablename__ = "msgs"
    __table_args__ = (UniqueConstraint("MsgKeyId", "LangId", name="uq_msgs_key_lang"),)
    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    msg_key_id: Mapped[int] = mapped_column("MsgKeyId", ForeignKey("msg_keys.Id"), index=True)
    lang_id: Mapped[int] = mapped_column("LangId", ForeignKey("langs.Id"), index=True)
    value: Mapped[str] = mapped_column("Value", Text)
