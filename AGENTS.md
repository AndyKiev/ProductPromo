# ProductPromo — project guide for AI coding agents

## Stack

- **Backend**: FastAPI (Python 3.11+, Poetry), SQLAlchemy 2.0 async, PostgreSQL 18 via asyncpg, JWT auth (RS256)
- **Frontend**: React 18, Vite 5, TypeScript 5.6, TanStack Router + Query, MUI 6, Zustand, react-hook-form + zod
- **Database**: Native Windows PostgreSQL 18 cluster at `127.0.0.1:5435` (not in Docker), data `D:\PostgresData\product_promo`. Once `scripts/register_postgres_service.ps1` has run (once, as Administrator) it is the Windows service `postgresql-productpromo`: Windows starts it at boot and stops it cleanly at shutdown. `make db-*` and the VS Code tasks go through `scripts/dev/pg.sh`, which never starts a console copy next to the service. Run `make` in WSL bash.
- **Docker**: Compose with `backend` (8012) and `frontend` (8013) containers. DB is on the host.

## Architecture

- Layered: `models` → `repositories` → `services` → `views` (routers)
- Dependency injection via FastAPI `Depends`
- File-based routing (TanStack Router generates `routeTree.gen.ts` from `src/routes/**`)
- Feature-based component directories under `src/components/admin/nomenclature/`

## Key commands

```bash
make db-up          # Start PostgreSQL
make db-down        # Stop PostgreSQL
make db-status      # Check if PostgreSQL is running
make init-db        # Create tables + seed data
make run-backend    # FastAPI on :8004
make run-frontend   # Vite on :8009
make docker-up      # Build & start containers
make docker-down    # Stop containers
```

**Dev shortcuts page** — `C:\Users\andre\Desktop\Dev shortcuts.html` (WSL: `/mnt/c/Users/andre/Desktop/Dev shortcuts.html`) is Andrey's one list of every project's desktop icon, start/stop key and ports. If you change a port, a start/stop task in `.vscode/tasks.json` or a VS Code key binding, update this project's row there in the same change. Why: vault page `Dev Shortcuts Page`.

## Conventions

- Backend uses **PascalCase** column names (e.g. `MarketName`, `StatusId`)
- API prefix: `/api/v1`. Responses: `{ detail: string, data: T | null }`
- Frontend API helpers: `src/components/admin/nomenclature/<entity>/<entity>Api.ts`
- Mutations use TanStack Query `useMutation` with `qc.invalidateQueries` on success
- i18n: DB tables `langs`, `msg_keys`, `msgs`; persisted account `lang_id` (never hardcode IDs).
  English/Russian UI seeds: `backend/backend/api_v1/msg/ui.json`; sync frontend fallback with
  `node scripts/sync_i18n.mjs`, seed using `make init-db`. Components use `useString()`.
  Domain keys + fallback + Russian seed live in `<domain>_messages.py`; use `${name}` parameters.
  Success resolver returns fields for `MutationResponse(**detail, data=...)`. See `docs/TRANSLATIONS.md`.
- Button labels use lowercase English: `getString('create')` → `"create"`, `getString('save')` → `"save"`
- Nomenclature hierarchy: Market → Segment → Category → Family → Link (4-way join)
- API types: `cd frontend && npm run gen:api` regenerates `src/api/schema.gen.ts` (openapi-typescript) from the
  running backend (`OPENAPI_URL`, default Docker :8012). Rerun after any backend schema change; typed calls go
  through `src/api/typedApi.ts` (wraps `axiosInstance`, so auth refresh and translated errors still apply).
- Simple lookups: add one line `directory('/api/v1/<resource>')` to a section config (e.g.
  `components/admin/promo/promoDirectories.ts`). `DirectoryCrud` derives columns, form fields, required,
  maxLength and editability from `/openapi.json` at runtime — put constraints on the Pydantic `Field`, not the UI.

## Nomenclature entities

| Entity | Table | Key fields |
|--------|-------|------------|
| Market | `market` | `Id`, `MarketName` |
| Segment | `segment` | `Id`, `IdMarket`, `IdStatus`, `Code`, `SegmentName` |
| Category | `category` | `Id`, `IdSegment`, `IdStatus`, `Code`, `CategoryName` |
| Family | `family` | `Id`, `IdCategory`, `IdStatus`, `Code`, `FamilyName` |
| NomenclatureKey | `nomenclature_key` | `Id`, `Name` |
| Nomenclature | `nomenclature` | `Id`, `IdMarket`, `IdSegment`, `IdCategory`, `IdFamily` |

## Auth

- Dev stub JWT (RS256), single user: `UKR7101004` / `111`
- Login: POST `/api/v1/jwt/login` (form-encoded `username` + `password`)
- Refresh: POST `/api/v1/jwt/refresh` (JSON `{ refresh_token }`)
- Tokens stored in Zustand `authStore` persisted to `localStorage` (key: `productpromo-auth`)

## Env files

- Native dev: `backend/.env`, `frontend/.env`
- Docker: `stack.env` (variables passed to containers, prefixed `APP_CONFIG__`)
