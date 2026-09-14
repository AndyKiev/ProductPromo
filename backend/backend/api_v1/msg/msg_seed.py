from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from backend.database.db_helper import db_helper
from backend.api_v1.lang.lang_model import Lang
from backend.api_v1.msg_key.msg_key_model import MsgKey
from backend.api_v1.msg.msg_model import Msg
from backend.api_v1.msg.catalog import FALLBACKS


async def seed_translations() -> None:
    """Insert only missing values. Never overwrite a translator's edits."""
    async with db_helper.session_factory() as session, session.begin():
        await session.execute(insert(Lang).values([
            {"short_name": "eng", "name": "English", "locale": "en"},
            {"short_name": "rus", "name": "Русский", "locale": "ru"},
        ]).on_conflict_do_nothing(index_elements=[Lang.short_name]))
        await session.execute(insert(MsgKey).values([
            {"name": key, "fallback": values["eng"]} for key, values in FALLBACKS.items()
        ]).on_conflict_do_nothing(index_elements=[MsgKey.name]))
        languages = {lang.short_name: lang.id for lang in (await session.scalars(select(Lang))).all()}
        keys = {key.name: key.id for key in (await session.scalars(select(MsgKey))).all()}
        values = [{"msg_key_id": keys[key], "lang_id": languages[code], "value": text}
                  for key, entry in FALLBACKS.items() for code, text in entry.items()]
        await session.execute(insert(Msg).values(values).on_conflict_do_nothing(
            index_elements=[Msg.msg_key_id, Msg.lang_id]))
