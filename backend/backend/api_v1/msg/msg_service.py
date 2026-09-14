from backend.api_v1.lang.lang_errors import LangNotFound
from backend.api_v1.msg.catalog import catalog_cache
from backend.api_v1.msg.msg_schema import MessageBundle


class MsgService:
    async def bundle(self, lang_id: int) -> MessageBundle:
        catalog = await catalog_cache.get()
        if lang_id not in catalog.languages:
            raise LangNotFound(lang_id)
        return MessageBundle(lang_id=lang_id, version=catalog.version, messages=catalog.bundle(lang_id))
