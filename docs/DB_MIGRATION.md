# Moving the ProductPromo database out of Docker

Done 2026-07-27. Same pattern as `talent/docs/RECOVERY_RUNBOOK.md` and
`anee_data/docs/DB_MIGRATION.md` — read the talent one for the *why*; this
records what was actually done here and how to operate the result.

## Where the database lives now

| | |
|---|---|
| Data dir | `C:\Users\andre\PostgresData\product_promo` |
| Log | `C:\Users\andre\PostgresData\product_promo.log` |
| Server | PostgreSQL 18.3 (native Windows, `C:\Program Files\PostgreSQL\18\bin`) |
| Host / port | `127.0.0.1` / `5435` |
| Database / user | `product_promo` / `admin` |
| Password | same as the anee_data cluster — see `%APPDATA%\postgresql\pgpass.conf`, or the gitignored `stack.env` |
| Auth | `scram-sha-256` |

The password is deliberately **not** written down here: this repo is meant to be
pushed to GitHub (see the README). It lives in `stack.env` and `backend/.env`,
both gitignored, and in `pgpass.conf`. The `*.example` files say
`<see docs/DB_MIGRATION.md>` where it goes.

It is **not a Windows service** — no admin rights were used — so it does not
start at boot. Start it explicitly, before native dev *and* before the stack:

```bash
make db-up
```

`make db-down`, `make db-status`, `make db-shell`, `make db-backup` are the rest.

### Why 5435 and not 5434

5434 was the port originally asked for, but it is already the **anee_data**
cluster. The host now runs four clusters:

| port | cluster |
|---|---|
| 5432 | the default PostgreSQL install |
| 5433 | talent |
| 5434 | anee_data |
| **5435** | **product_promo** |

5435 was already what `backend/.env` and the old compose `postgres` service
used, so nothing else had to move.

## What changed in the repo

- **`docker-compose.yml`** — the `postgres` service and the `postgres_data`
  volume are gone; `backend` got `extra_hosts: host.docker.internal:host-gateway`
  and points at `host.docker.internal:5435`. The `nginx` service is gone too
  (see below). Both services got `container_name`, `restart: unless-stopped`
  and bind mounts for live reload; the project is named `productpromo`.
- **Published ports moved** — backend `8012:8004`, frontend `8013:8009`.
- **`backend/.env`, `backend/.env.example`, `stack.env`, `stack.env.example`** —
  user/db are now `admin` / `product_promo` (password as above).
- **`frontend/.env.example`** — `VITE_BACKEND_API_URL` is no longer empty.
- **`backend/.dockerignore`, `frontend/.dockerignore`** — new; neither existed.
- **`Makefile`** — `run-postgres`/`stop-postgres` (which drove the compose
  service) are replaced by `db-up`/`db-down`/`db-status`/`db-shell`/`db-backup`
  against the host cluster, plus `docker-up`/`docker-start`/`docker-down`/`docker-logs`.
- **`backend/backend/database/init_db.py`** — new `bootstrap()`; see the bug
  notes below.

### nginx is gone

The host's port 80 belongs to `talent-nginx-1`, so this stack could never have
bound it. With the backend published directly and the SPA pointed at it, there
is nothing left to reverse-proxy. `nginx.conf` and the root `Dockerfile` are
still in the repo, unused — delete them if you are sure you want front-door
routing gone for good.

## Ports on this machine

Three stacks run side by side, so every host-side port had to be distinct.
Inside the containers nothing moved.

| | host | container |
|---|---|---|
| talent backend | 8005 | 8004 |
| anee_data backend | 8006 | 8005 |
| anee_data frontend | 5173 | 5173 |
| **productpromo backend** | **8012** | 8004 |
| **productpromo frontend** | **8013** | 8009 |

8009 was already taken on the host by a native Vite server, which is why the
frontend is not published on its own port number.

- Backend / Swagger — <http://127.0.0.1:8012/docs>
- Frontend — <http://127.0.0.1:8013>

## How the migration was done

The source data was in the Docker volume `productpromo_postgres_data`
(PG 16, 46 MB).

1. Checked the volume **before** reaching for a backup — destroying containers
   does not destroy data, and a restore would have overwritten good data with
   older data.
2. Started `postgres:16-alpine` on it, published on 55435. The image must match
   `PG_VERSION`; 18 would refuse the directory.
3. Dumped with the **host's PG18 `pg_dump` over TCP**, not `docker exec`. Newer
   pg_dump against an older server is the supported direction; the reverse is
   not, and this was a 16 → 18 jump. Output:
   `C:\Users\andre\PostgresBackups\productpromo_premigration_20260727.dump`.
4. Recorded row counts *before* restoring — an exit code of 0 does not prove a
   dump has content.
5. `initdb` with `-A scram-sha-256`. Without that flag initdb silently uses
   `trust`, i.e. no password at all.
6. `createdb product_promo`, then `pg_restore --no-owner --no-privileges` —
   necessary because the dump's objects are owned by `productpromo` and the new
   cluster only has `admin`.
7. Re-ran the same count query.

### Verification — counts before and after

Identical on both sides, which is the whole point of writing them down:

| table | rows |
|---|---|
| category | 3 |
| family | 1 |
| market | 4 |
| nomenclature | 1 |
| nomenclaturekey | 0 |
| segment | 3 |
| statustype | 2 |

There is no `alembic_version` — this project creates tables with
`Base.metadata.create_all()`, not migrations.

## Letting containers reach it

Containers are a different network, so `127.0.0.1` is the container, not the
host. Two edits, already applied to the cluster:

- `postgresql.conf`: `listen_addresses = '*'` (needs a **restart**, not a reload)
- `pg_hba.conf`, scoped to this db and user:

  ```
  host    product_promo   admin           172.16.0.0/12           scram-sha-256
  host    product_promo   admin           192.168.65.0/24         scram-sha-256
  ```

Test reachability before debugging anything else. If this fails, nothing else
will work:

```bash
docker run --rm --add-host=host.docker.internal:host-gateway -e PGPASSWORD=<password> postgres:16-alpine psql -h host.docker.internal -p 5435 -U admin -d product_promo -c "select 1"
```

**Editing those config files from PowerShell needs care.** `Set-Content
-Encoding utf8` and `Add-Content -Encoding utf8` write a UTF-8 **BOM** in
Windows PowerShell 5.1, and Postgres refuses to start with
`syntax error ... at end of line 1`. Write them with
`[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($false)))`.

## Bugs this surfaced

Both existed before and were invisible while the app ran natively.

| Symptom | Cause | Fix |
|---|---|---|
| `ModuleNotFoundError: No module named 'sqlalchemy'` in the container, though the image has it | an anonymous `/app/backend/.venv` volume (copied from anee_data's compose) creates an **empty** directory, and poetry adopts any `.venv` it finds in the project dir as an in-project venv regardless of `virtualenvs.create=false` | drop the anonymous volume — the bind mount is `./backend/backend`, which never exposes the host's `.venv` anyway |
| `got Future attached to a different loop` during startup seeding | `entrypoint.sh` ran `asyncio.run(init_db())` and `asyncio.run(seed_status_types())` as two calls; `db_helper.engine` is module-level and its pool binds to the first loop | new `bootstrap()` in `init_db.py` awaits both inside one loop; entrypoint and `make init-db` call that |

## Notes and leftovers

- **CORS.** The SPA on 8013 calls the API on 8012 — cross-origin. It works
  because `CORSConfig.origins` is `["*"]` with `credentials: False`. If
  credentials are ever turned on, `"*"` stops being legal and the real origins
  must be listed.
- **`VITE_BACKEND_API_URL` is an origin, not a base path.** The client appends
  `/api/v1` itself (`src/utils/eNums.ts`, `src/api/axiosInstance.ts`), so
  `http://127.0.0.1:8012` — not `.../api/v1`. (anee_data's value *does* include
  the suffix; its client is written differently.)
- **The old volume is still there** (`productpromo_postgres_data`), as is the
  pre-migration dump. They are the fallback if something turns out to be
  missing. Delete only once you are confident.
- **Collation changed.** The container cluster used glibc; the new one uses ICU
  `uk-UA` (`--locale=C` for the rest), because glibc locales do not exist on
  Windows. `pg_restore` rebuilt every index under the new collation, so nothing
  is corrupt — but text `ORDER BY` can differ slightly on punctuation, case and
  accents. Worth knowing if a sorted grid ever looks subtly reordered.
- **Password for the CLI tools** lives in `%APPDATA%\postgresql\pgpass.conf`
  (`127.0.0.1:5435:*:admin:<password>`). Without it `pg_dump`/`psql` prompt on
  stdin and `make db-backup` appears to hang while it waits.
- **Backups.** A volume surviving one crash is luck. `make db-backup` writes a
  timestamped `-Fc` dump to `C:\Users\andre\PostgresBackups\`. Refresh after big
  data changes — a stale snapshot is worse than none, because it looks usable.
- **`stack.env` was tracked in git** despite its own header claiming otherwise,
  so the new credentials would have been published on the next push. It is now
  in `.gitignore` and was removed with `git rm --cached` (the file stays on
  disk). The old committed copy still has the previous
  `productpromo`/`productpromo` dev pair in history — harmless, but that is why
  history is not clean of credentials.
- **Auto-reload works in both containers, but needed polling.** Windows bind
  mounts deliver no inotify events. The backend needs
  `WATCHFILES_FORCE_POLLING=true` (compose) plus `--reload`, which
  `entrypoint.sh` now adds when `APP_CONFIG__RUN__RELOAD=true`. The frontend
  needs `server.watch.usePolling` in `vite.config.ts`, gated on `VITE_IN_DOCKER`
  — note that `CHOKIDAR_USEPOLLING` is a webpack-dev-server convention and Vite
  ignores it entirely, so setting it looks like a fix but does nothing.
- **Vite HMR needs `hmr.clientPort: 8013`.** The browser reaches the container
  on the published port, not the 8009 the dev server listens on; without this
  the page loads fine and only the HMR socket silently fails.
- **JWT keys are regenerated on every container recreate** — they are not in a
  volume, unlike talent. After `docker compose up --build` any existing token
  stops validating, so log in again. Fine for a single-user dev app; put them in
  a volume if that ever stops being true.
- **`frontend/.env` now exists** (it did not before). Without it
  `make run-frontend` leaves `VITE_BACKEND_API_URL` undefined, which falls back
  to same-origin — and with nginx gone, that 404s off the Vite server.

## Operating it

```bash
make db-up            # start the host Postgres (required, every boot)
make docker-up        # build + start backend and frontend
make docker-logs      # follow
make docker-down      # stop containers; the database is untouched
```
