---
name: be-essence
description: Scaffold a new BACKEND essence (vertical slice) under backend/backend/api_v1/ for each entity for ProductPromo — model, schema, repository, service, dependencies, views, errors, success — plus router registration in main_router.py and model registration in database/init_db.py. Use when adding a new domain entity/table to the ProductPromo FastAPI backend. Pairs with /fe-essence.
---

# New backend essence

An **essence** is a vertical slice in `backend/backend/api_v1/<essence_name>/`. Logic lives
in `base_repository.py` / `base_service.py`, so most files are tiny. Generate the domain files including `<essence>_messages.py`,
wire the router + model, then run `make init-db` (there is **no Alembic**). Kill any
boilerplate the base classes already cover.

Naming: folder + files `snake_case`; classes `PascalCase`; router prefix is a plural kebab
or slash path (never a dash inside a Python identifier). The **canonical reference is
`backend/backend/api_v1/category/`** — read it before generating.

## Physical columns

- **Legacy tables** (already in the DB: `market`, `segment`, `category`, `family`,
  `nomenclature`, `statustype`, ...) map PascalCase physical names:
  `mapped_column("RealName", ...)`. `__tablename__` is the legacy name verbatim.
- **New tables** follow AGENTS.md: PascalCase physical columns, snake_case Python attributes,
  e.g. `mapped_column("LangId", ForeignKey("langs.Id"))`. `Base.metadata.create_all()` creates tables.

## The eight files

`<essence>_model.py`
```python
from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class <Essence>(Base):
    __tablename__ = "<essence_plural>"          # legacy tables keep their real name

    id: Mapped[int] = mapped_column("Id", Integer, primary_key=True)
    code: Mapped[str] = mapped_column("Code", String(16), nullable=False, unique=True, index=True)
    name: Mapped[str | None] = mapped_column("Name", String(128), nullable=True)

    # many-to-one lookups: eager-load so the schema can render names
    # status = relationship("StatusType", lazy="joined")
```
Add `__table_args__ = (UniqueConstraint("a_id", "b_id", name="uq_<essence>"),)` for link
tables.

`<essence>_schema.py` — Base/Create/Update/Read. `Update` fields are all `Optional`.
```python
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class <Essence>Base(BaseModel):
    code: str = Field(..., max_length=16)
    name: Optional[str] = Field(None, max_length=128)


class <Essence>Create(<Essence>Base):
    pass


class <Essence>Update(BaseModel):
    code: Optional[str] = Field(None, max_length=16)
    name: Optional[str] = Field(None, max_length=128)


class <Essence>(<Essence>Base):
    model_config = ConfigDict(from_attributes=True)
    id: int
    # resolved display names for UI:
    # status_name: Optional[str] = None
```

`<essence>_repository.py` — lookups + custom queries only; CRUD is inherited.
```python
from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.<essence>.<essence>_model import <Essence>


class <Essence>Repository(BaseRepository):
    model = <Essence>

    async def by_code(self, code: str):
        return await self.get_all(filters={"code": code})
```
For a paged list, add a `list_paged(...) -> tuple[list, int]` that builds a `select`, applies
whitelisted filters, runs `select(func.count()).select_from(stmt.subquery())`, then
`.order_by(...)`, `.limit(page_size).offset(page * page_size)`. **Whitelist sort columns.**

`<essence>_service.py` — read/write methods returning schemas / `MutationResponse`.
```python
class <Essence>Service(BaseService):
    def __init__(self, repository: <Essence>Repository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    async def get_by_id(self, id: int) -> <Essence>Schema:
        row = await self.repository.get_by_id(id)
        if not row:
            raise await self._resolve_domain_error(<Essence>NotFound(id))
        return self._to_schema(row)

    def _to_schema(self, row) -> <Essence>Schema:
        s = <Essence>Schema.model_validate(row)
        # s.status_name = ...
        return s

    async def create_<essence>(self, body: <Essence>Create) -> MutationResponse[<Essence>Schema]:
        try:
            created = await self.create(body)
            schema = self._to_schema(await self.repository.get_by_id(created.id))
            detail = await self._resolve_domain_success(<Essence>CreateSuccess(body.code))
            return MutationResponse(**detail, data=schema)
        except IntegrityError as e:
            if self._is_unique_violation(e):
                raise await self._resolve_domain_error(<Essence>CodeTaken(body.code))
            raise
```
`BaseService` already provides `get_all(sort_json=)`, `create`, `update(instance, schema,
partial=True)`, `delete_by_id`, `exists_by_name`. For paged reads return
`Page[<Essence>Schema](items=[...], total=total)` (`base/page.py`).

`<essence>_dependencies.py`
```python
async def get_<essence>_service(
    session: AsyncSession = Depends(db_helper.session_getter),
    user: UserSchema = Depends(get_current_active_auth_user),
) -> <Essence>Service:
    return <Essence>Service(repository=<Essence>Repository(session=session), user=user, session=session)


async def <essence>_by_id(
    item_id: int,
    service: <Essence>Service = Depends(get_<essence>_service),
) -> <Essence>Schema:
    return await service.get_by_id(item_id)
```

`<essence>_views.py` — `HTTPBearer(auto_error=False)` on the router.
```python
router = APIRouter(
    prefix="/<essence_plural>",
    tags=["<Area>"],
    dependencies=[Depends(HTTPBearer(auto_error=False))],
)
```
- GET list → `response_model=List[<Essence>Schema]` or `Page[<Essence>Schema]` for paged.
- GET one → `response_model=<Essence>Schema`.
- POST → `response_model=MutationResponse[<Essence>Schema]`, `status_code=201`.
- PATCH → `response_model=MutationResponse[<Essence>Schema]`.
- DELETE → `response_model=MutationResponse[None]`.
The **view owns nothing but delegation** — it never commits (`BaseRepository` already does).

`<essence>_messages.py` owns stable keys, English fallback templates and initial Russian translations:
```python
ENTITY_NOT_FOUND = {
    "message_key": "entityNotFound",
    "fallback": "Entity with ID ${id} not found",
    "rus": "Сущность с ID ${id} не найдена",
}
```
Error/success classes import these constants, set `message_key`, `fallback` (a template,
not an f-string), and `template_vars = {"id": id_}`. Keep the existing error classes/statuses.
Use `await self._resolve_domain_error(exc)` and `await self._resolve_domain_success(success)`.
The latter returns response fields: pass `MutationResponse(**detail, data=schema)`.

Messages live in `msgs` with a dynamic `lang_id` FK, and keys in `msg_keys`.
Never assume English or Russian has a fixed ID. Inject `get_current_active_auth_user`
so services receive the persisted profile language. The catalog cache uses a separate
DB session; never translate through a failed business transaction.

`msg/catalog.py` discovers domain message modules; `seed_translations()` inserts missing
keys/texts without overwriting DB edits. Run `make init-db` after adding messages.
Verify both languages and matching `${parameter}` sets with
`poetry run python -m pytest tests/test_i18n.py -q` from `backend/`.

## Error taxonomy

| Class | Status | Use for |
|---|---|---|
| `NotFoundError` | 404 | record does not exist |
| `AlreadyExistsError` | 409 | unique constraint would be violated |
| `DeleteError` | 409 | row is referenced and cannot be deleted |
| `DomainError` | 400 | invalid input / rule violation |

`get_...()` raises `NotFoundError`. Never inline a dict at the raise site — define the class
in `*_errors.py`.

## Wiring (all required)

1. **Router** → `backend/backend/routers/main_router.py`: import `router as <essence>_router`
   from `..._views` and `router.include_router(<essence>_router)`. Define concrete-top-level
   prefixes (e.g. `/product-statuses`) so they never collide with `/{id}` paths.
2. **Model** → `backend/backend/database/init_db.py`: add
   `import backend.api_v1.<essence>.<essence>_model  # noqa: F401,E402` at the bottom.
   Without it `create_all()` never sees the table.
3. **Tables** → run `make init-db` (from repo root). There is no Alembic.

## Output to the user

- A file tree of what was created.
- The copyable lines added to `main_router.py` and `init_db.py`.
- A note that `make init-db` creates the table(s).
- Flag any `base_repository` / `base_service` method that made part of the scaffold unnecessary.
