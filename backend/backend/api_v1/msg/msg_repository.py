from sqlalchemy import select
from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.msg.msg_model import Msg
from backend.api_v1.msg_key.msg_key_model import MsgKey


class MsgRepository(BaseRepository):
    model = Msg

    async def catalog_rows(self):
        result = await self.session.execute(
            select(Msg.lang_id, MsgKey.name, Msg.value)
            .join(MsgKey, MsgKey.id == Msg.msg_key_id)
        )
        return result.all()
