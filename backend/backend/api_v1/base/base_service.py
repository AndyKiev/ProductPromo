import json
from typing import Optional
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession


class BaseService:
    """Slim base service satisfying the feature contract:
    create / update / get_all(sort_json=) / exists_by_name / delete_by_id /
    _resolve_domain_error / _resolve_domain_success.

    Messages resolve through the DB catalog using the authenticated user's lang_id.
    """

    # PostgreSQL unique violation code
    PG_UNIQUE_VIOLATION = "23505"
    # MySQL duplicate entry code
    MYSQL_DUPLICATE_ENTRY = "1062"

    def __init__(self, repository, user=None, session: Optional[AsyncSession] = None) -> None:
        self.repository = repository
        self.user = user
        self.session = session

    # ---- reads ----
    async def get_all(self, sort_json: Optional[str] = None):
        sort = None
        if sort_json:
            try:
                parsed = json.loads(sort_json)
                item = parsed[0] if isinstance(parsed, list) and parsed else parsed
                if isinstance(item, dict) and item.get("field"):
                    sort = item["field"] if item.get("order", "asc") == "asc" else f"-{item['field']}"
            except (ValueError, TypeError):
                sort = sort_json  # treat as a bare field name
        return await self.repository.get_all(sort=sort)

    # ---- writes ----
    async def create(self, schema):
        instance = self.repository.model(**schema.model_dump())
        return await self.repository.create(instance)

    async def update(self, instance, schema, partial: bool = True):
        data = schema.model_dump(exclude_unset=partial)
        return await self.repository.update(instance, data)

    async def exists_by_name(self, name, already_exists_exc, exclude_id: Optional[int] = None):
        if await self.repository.exists_by_name(name, exclude_id=exclude_id):
            raise await self._resolve_domain_error(already_exists_exc(name))

    async def delete_by_id(self, id, name=None, delete_error_exc=None, delete_success_exc=None):
        obj = await self.repository.get_by_id(id)
        if obj is None:
            return None
        try:
            await self.repository.delete(obj)
        except IntegrityError:
            if delete_error_exc is not None:
                raise await self._resolve_domain_error(delete_error_exc(name))
            raise
        return None

    # ---- message resolution from a separate cached DB snapshot ----
    async def _resolve_domain_error(self, exc):
        from backend.api_v1.msg.catalog import catalog_cache
        catalog = await catalog_cache.get()
        exc.lang_id = getattr(self.user, "lang_id", None) or catalog.default_id
        exc.resolved_message = catalog.text(getattr(exc, "message_key", "invalidValue"), exc.lang_id,
                                           getattr(exc, "template_vars", None), getattr(exc, "fallback", str(exc)))
        return exc

    async def _resolve_domain_success(self, success) -> dict:
        from backend.api_v1.msg.catalog import catalog_cache
        catalog = await catalog_cache.get()
        key = success.message_key
        lang_id = getattr(self.user, "lang_id", None) or catalog.default_id
        params = getattr(success, "template_vars", {})
        return {"detail": catalog.text(key, lang_id, params, success.fallback),
                "message_key": key, "params": params, "lang_id": lang_id}

    @staticmethod
    def _is_unique_violation(exc: IntegrityError) -> bool:
        """Check if IntegrityError is a unique constraint violation (not FK or other)."""
        orig = getattr(exc, "orig", None)
        if orig is None:
            return False
        code = getattr(orig, "sqlstate", None) or getattr(orig, "args", [None])[0]
        if isinstance(code, int):
            code = str(code)
        return code in (BaseService.PG_UNIQUE_VIOLATION, BaseService.MYSQL_DUPLICATE_ENTRY)
