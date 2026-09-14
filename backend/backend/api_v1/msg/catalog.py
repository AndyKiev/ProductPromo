"""DB catalog snapshots. Never query the business transaction to render an error."""
import asyncio
import hashlib
import importlib
import json
import logging
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from sqlalchemy.exc import SQLAlchemyError
from backend.api_v1.lang.lang_repository import LangRepository
from backend.api_v1.lang.lang_schema import LangRead
from backend.api_v1.msg.msg_repository import MsgRepository

logger = logging.getLogger(__name__)


def definitions() -> dict[str, dict[str, str]]:
    result = json.loads(Path(__file__).with_name("ui.json").read_text(encoding="utf-8"))
    api = Path(__file__).parents[1]
    for path in sorted(api.glob("*/*_messages.py")):
        module = importlib.import_module(f"backend.api_v1.{path.parent.name}.{path.stem}")
        for value in vars(module).values():
            if isinstance(value, dict) and "message_key" in value:
                key = value["message_key"]
                entry = {"eng": value["fallback"], "rus": value["rus"]}
                if key in result and result[key] != entry:
                    raise ValueError(f"Conflicting translation key: {key}")
                result[key] = entry
    return result


FALLBACKS = definitions()


def substitute(template: str, params: dict | None = None) -> str:
    params = params or {}
    # One pass: a value containing ${another} is data, never another template.
    return re.sub(r"\$\{(\w+)\}", lambda m: str(params[m[1]]) if m[1] in params and params[m[1]] is not None else m[0], template)


@dataclass
class Catalog:
    languages: dict[int, LangRead] = field(default_factory=dict)
    messages: dict[int, dict[str, str]] = field(default_factory=dict)
    version: str = "fallback"

    @property
    def default_id(self) -> int | None:
        return next((id_ for id_, lang in self.languages.items() if lang.short_name == "eng"), None)

    def text(self, key: str, lang_id: int | None, params: dict | None = None, fallback: str | None = None) -> str:
        lang = self.languages.get(lang_id)
        code = lang.short_name if lang else "eng"
        defaults = FALLBACKS.get(key, {})
        value = (self.messages.get(lang_id, {}).get(key) or defaults.get(code)
                 or self.messages.get(self.default_id, {}).get(key) or fallback or defaults.get("eng") or key)
        return substitute(value, params)

    def bundle(self, lang_id: int) -> dict[str, str]:
        keys = set(FALLBACKS) | set(self.messages.get(self.default_id, {})) | set(self.messages.get(lang_id, {}))
        return {key: self.text(key, lang_id) for key in sorted(keys)}


class CatalogCache:
    def __init__(self):
        self.snapshot = Catalog()
        self.expires = 0.0
        self.lock = asyncio.Lock()

    async def get(self, force: bool = False) -> Catalog:
        if not force and time.monotonic() < self.expires:
            return self.snapshot
        async with self.lock:
            if not force and time.monotonic() < self.expires:
                return self.snapshot
            from backend.database.db_helper import db_helper
            try:
                async with db_helper.session_factory() as session:
                    langs = await LangRepository(session).get_all()
                    rows = await MsgRepository(session).catalog_rows()
                languages = {lang.id: LangRead.model_validate(lang) for lang in langs}
                messages: dict[int, dict[str, str]] = {}
                for lang_id, key, value in rows:
                    messages.setdefault(lang_id, {})[key] = value
                version = hashlib.sha256(json.dumps(messages, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]
                self.snapshot = Catalog(languages, messages, version)
                self.expires = time.monotonic() + 30
            except (SQLAlchemyError, OSError):
                logger.exception("Translation catalog refresh failed; retaining last snapshot")
                self.expires = time.monotonic() + 5
            return self.snapshot


catalog_cache = CatalogCache()
