from fastapi import Request
from backend.api_v1.msg.catalog import catalog_cache


async def initialize_language(request: Request) -> None:
    catalog = await catalog_cache.get()
    request.state.catalog = catalog
    requested = request.headers.get("X-Lang-Id", "")
    lang_id = int(requested) if requested.isdigit() and len(requested) < 12 else None
    request.state.lang_id = lang_id if lang_id in catalog.languages else catalog.default_id


def request_text(request: Request, key: str, params: dict | None = None, fallback: str | None = None) -> str:
    catalog = getattr(request.state, "catalog", catalog_cache.snapshot)
    return catalog.text(key, getattr(request.state, "lang_id", catalog.default_id), params, fallback)
