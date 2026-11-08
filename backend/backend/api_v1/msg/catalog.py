"""This service's translation catalog: seeds from ui.json + every
api_v1/*/*_messages.py, live values from the langs/msgs tables.

The engine (Catalog, CatalogCache, substitution) is pp_common.i18n; this module
only supplies the fallbacks and the DB loader, and registers the cache so
BaseService, the language middleware and the error handlers can find it.
Snapshots use their own session: never query the business transaction to render an error.
"""
from pathlib import Path

from pp_common.i18n import CatalogCache, LangRead, Messages, collect_definitions, set_catalog_cache

from backend.api_v1.lang.lang_repository import LangRepository
from backend.api_v1.msg.msg_repository import MsgRepository

FALLBACKS = collect_definitions("backend.api_v1", Path(__file__).with_name("ui.json"))


async def load_from_db() -> tuple[list[LangRead], Messages]:
    from backend.database.db_helper import db_helper
    async with db_helper.session_factory() as session:
        langs = await LangRepository(session).get_all()
        rows = await MsgRepository(session).catalog_rows()
    messages: Messages = {}
    for lang_id, key, value in rows:
        messages.setdefault(lang_id, {})[key] = value
    return [LangRead.model_validate(lang) for lang in langs], messages


catalog_cache = CatalogCache(load_from_db, FALLBACKS)
set_catalog_cache(catalog_cache)
