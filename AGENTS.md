# catalog — project guide for AI coding agents

**catalog is the master data service**: nomenclature, products, EAN, taxes,
suppliers and product-supplier links. It logs its own users in and publishes the language list over
RabbitMQ. Sibling repos under `~/projects`, each a **separate
project launched on its own**; backends talk **only through RabbitMQ** (`../broker`):

| Repo | Role | Port |
|---|---|---|
| `catalog` | this app: backend 8012, its own frontend 8013 | 8012 / 8013 |
| `promo` | separate app: promo types/subtypes, sessions, buyer entry, Excel upload | 8016 / 8018 |
| `employee` | separate app: employees and jobs; every app copies them over RabbitMQ | 8017 / 8019 |
| `broker` | RabbitMQ; its AGENTS.md is the contract between backends | 5674 / 15674 |
| `common` | `pp-common`, the shared Python base (tagged git dependency) | – |
| `ui` | `@catalog/ui`, the shared React UI kit (tagged git dependency) | – |

**No promo code here**, backend or frontend. Promo features go in `../promo`; this app's UI is `frontend/`. Never call another
service over HTTP, share its network/DB/files, or start it from here: publish or consume events instead.

## Stack

- **Backend**: FastAPI (Python 3.11+, Poetry), SQLAlchemy 2.0 async, PostgreSQL 18 via asyncpg, JWT auth (RS256)
- **Database**: Native Windows PostgreSQL 18 cluster at `127.0.0.1:5435` (not in Docker), data `D:\PostgresData\product_promo`. Once `scripts/register_postgres_service.ps1` has run (once, as Administrator) it is the Windows service `postgresql-catalog`: Windows starts it at boot and stops it cleanly at shutdown. `make db-*` and the VS Code tasks go through `scripts/dev/pg.sh`, which never starts a console copy next to the service. Run `make` in WSL bash.
- **Docker**: Compose with `backend` (8012) and `frontend` (8013). DB is on the host.
- **VS Code**: Ctrl+Alt+5 (`catalog: start`) starts DB + this service only; Ctrl+Alt+Shift+5 stops them.
  That includes this app's frontend (:8013). promo (6), employee (E) and broker (9) have their own keys.
- **RabbitMQ**: `backend/messaging/identity.py` publishes the languages on exchange `identity` (on every
  (re)connect and on `identity.sync.requested`) and consumes exchange `employee` into the `employee` / `job`
  copy. The broker is optional at startup.

## Architecture

- Layered: `models` → `repositories` → `services` → `views` (routers)
- Shared base lives in **pp-common** (`~/projects/common`, git dep pinned by tag in
  `backend/pyproject.toml`): `pp_common.crud` (BaseRepository/BaseService/errors/success/MutationResponse/Page),
  `pp_common.i18n` (catalog engine; this service registers its cache in `api_v1/msg/catalog.py`),
  `pp_common.auth` (tokens, `CurrentUser`), `pp_common.web` (`create_app`), `pp_common.config`, `pp_common.db`.
  Don't re-add base classes here; change pp-common, tag a release, bump the tag, `poetry lock`.
  `api_v1/base/` keeps only service-specific bits (`base_model.Base`, legacy mixins, `i18n.py` Name-column logic).
- Dependency injection via FastAPI `Depends`

## Key commands

```bash
make db-up          # Start PostgreSQL
make db-down        # Stop PostgreSQL
make db-status      # Check if PostgreSQL is running
make init-db        # Create tables + seed data
make run-backend    # FastAPI on :8004
make docker-up      # Build & start containers
make docker-down    # Stop containers
```

**Dev shortcuts page** — `C:\Users\andre\Desktop\Dev shortcuts.html` (WSL: `/mnt/c/Users/andre/Desktop/Dev shortcuts.html`) is Andrey's one list of every project's desktop icon, start/stop key and ports. If you change a port, a start/stop task in `.vscode/tasks.json` or a VS Code key binding, update this project's row there in the same change. Why: vault page `Dev Shortcuts Page`.

## Conventions

- Backend uses **PascalCase** column names (e.g. `MarketName`, `StatusId`)
- API prefix: `/api/v1`. Responses: `{ detail: string, data: T | null }`
- i18n: DB tables `langs`, `msg_keys`, `msgs`; persisted account `lang_id` (never hardcode IDs).
  English/Russian UI seeds: `backend/backend/api_v1/msg/ui.json` (the texts this backend serves at `/messages`; the UI kit keeps an offline copy,
  `npm run i18n:sync` in `../ui`), seed using `make init-db`. Generic error keys come from pp-common.
  Domain keys + fallback + Russian seed live in `<domain>_messages.py`; use `${name}` parameters.
  Success resolver returns fields for `MutationResponse(**detail, data=...)`. See `docs/TRANSLATIONS.md`.
- Nomenclature hierarchy: Market → Segment → Category → Family → Link (4-way join)
- The SPA reads this service's `/openapi.json` (typed client, generic lookup screens): put constraints on the
  Pydantic `Field`, and mark reference fields with `json_schema_extra={"x-lookup": "<collection path>"}`.
  After a schema change, run `npm run gen:api` in `frontend/`.

## Nomenclature entities

| Entity | Table | Key fields |
|--------|-------|------------|
| Market | `market` | `Id`, `MarketName` |
| Segment | `segment` | `Id`, `IdMarket`, `IdStatus`, `Code`, `SegmentName` |
| Category | `category` | `Id`, `IdSegment`, `IdStatus`, `Code`, `CategoryName` |
| Family | `family` | `Id`, `IdCategory`, `IdStatus`, `Code`, `FamilyName` |
| NomenclatureKey | `nomenclature_key` | `Id`, `Name` |
| Nomenclature | `nomenclature` | `Id`, `IdMarket`, `IdSegment`, `IdCategory`, `IdFamily` |

## Auth: this app logs its users in itself
Every catalog app has its own login; no backend authenticates for another and no signing key is
shared (vault: `Decisions/2026-11-09 Each App Logs In Itself`).

- Login: POST `/api/v1/jwt/login` (form-encoded `username` + `password`); refresh: POST `/api/v1/jwt/refresh`
  (JSON `{ refresh_token }`); profile: GET `/api/v1/jwt/users/me`, PATCH `/api/v1/jwt/users/me/language`.
  All built by `pp_common.auth` in `backend/auth/jwt_auth.py`.
- LDAP like talent (`APP_CONFIG__LDAP__SERVER`). **Dev: `APP_CONFIG__LDAP__BYPASS=true`** = the username is
  the matricule and the password is not checked. Dev login: `UKR7101004`, any password.
- The matricule must be an active row of this app's `employee` copy (`backend/api_v1/employee`, fed from the
  employee service over RabbitMQ; the dev employee is seeded by `make init-db`).
- Keys: `backend/backend/auth/keys/` (generated once, kept). Tokens carry `aud = catalog`; a promo or employee
  token gets 401 here, and this app's token gets 401 there.

## Env files

- Native dev: `backend/.env`
- Docker: `stack.env` (variables passed to containers, prefixed `APP_CONFIG__`)

## Frontend: this app's own UI (`frontend/`)
- **catalog is a separate app all the way to the browser**: its own frontend on http://127.0.0.1:8013, its own
  login page, title and browser tab ("catalog"), and only its own sections. It never shows another app's screens
  and there is no shared web app or app switcher (Andrey, 2026-11-10; vault `Decisions/2026-11-10 Each App Has Its Own Frontend`).
- Compose service `frontend` (container `catalog-frontend`): starts and stops with the project (Ctrl+Alt+5).
  It calls only this project's backend (`VITE_API_URL=http://127.0.0.1:8012`).
- Stack: React 19, Vite, TanStack Router + Query, Tailwind 4 + shadcn/ui, MUI only for DataGrid and date pickers.
- **Shared UI comes from `@catalog/ui`** (`~/projects/ui`, git dependency pinned by tag in `frontend/package.json`,
  imported as `@ui/...`): shell, login page, components, forms, theme, axios, i18n. Don't copy kit code here: change
  `ui`, tag a release, bump the tag, `npm install`, `docker compose up -d --build -V frontend`. Its rules: `~/projects/ui/AGENTS.md`.
- `frontend/src/app.ts` names the app and lists ITS sections; `src/routes` are its screens; `src/api/*.gen.ts` is
  generated from this backend's OpenAPI (`npm run gen:api` in `frontend/`, backend running).
- A new Vite dependency used by the kit must be added to `optimizeDeps.include` in `frontend/vite.config.ts`.
- e2e: `e2e/` (Playwright, run from Windows: `node node_modules/@playwright/test/cli.js test`), this app only.
