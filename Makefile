# ProductPromo — dev entry points.
#
# The database is a NATIVE Windows PostgreSQL 18 cluster on the host, not a
# container: C:\Users\andre\PostgresData\product_promo, 127.0.0.1:5435.
# It is not a Windows service, so it does not start at boot — run `make db-up`
# first, both for native dev and before `make docker-up`.
# See docs/DB_MIGRATION.md.

PGDATA_DIR = C:/Users/andre/PostgresData/product_promo
PGLOG      = C:/Users/andre/PostgresData/product_promo.log
PGPORT     = 5435
PGUSER     = admin
PGDB       = product_promo

# Source CSV for `make import-products` (override with `make import-products CSV=...`).
CSV        = C:/Users/andre/Desktop/DataSamples/Article_METI_11.09.2026.csv

# Source xlsx for `make import-ean` (override with `make import-ean XLSX=...`).
XLSX       = C:/Users/andre/Desktop/DataSamples/EAN_all_2026 09 11.xlsx

# --- Host PostgreSQL ---------------------------------------------------------

# start the host Postgres cluster (idempotent: no-op if already running)
db-up:
	pg_ctl -D "$(PGDATA_DIR)" status >nul 2>&1 || pg_ctl -D "$(PGDATA_DIR)" -l "$(PGLOG)" -o "-p $(PGPORT)" start

# stop it
db-down:
	pg_ctl -D "$(PGDATA_DIR)" stop

# is it running?
db-status:
	pg_ctl -D "$(PGDATA_DIR)" status

# open a psql shell on the product_promo database
db-shell:
	psql -h 127.0.0.1 -p $(PGPORT) -U $(PGUSER) -d $(PGDB)

# timestamped -Fc dump (see docs/DB_MIGRATION.md)
db-backup:
	pg_dump -h 127.0.0.1 -p $(PGPORT) -U $(PGUSER) -d $(PGDB) -Fc -f "C:/Users/andre/PostgresBackups/product_promo_$(shell date +%Y%m%d_%H%M).dump"

# --- Docker: the app stack (backend + frontend) ------------------------------
# Postgres is NOT in compose — run `make db-up` first. See docker-compose.yml.
# Published: backend http://127.0.0.1:8012, frontend http://127.0.0.1:8013

# build images and start everything (first run, or after a dependency change)
docker-up:
	docker compose up --build -d

# start without rebuilding
docker-start:
	docker compose up -d

# stop and remove the containers. The host database is untouched.
docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# --- Native dev (no docker) --------------------------------------------------
# Requires poetry (backend), node 20+ (frontend), and `make db-up`.

install-backend:
	cd backend && poetry install

install-frontend:
	cd frontend && npm install

# Create tables in the DB (idempotent). Needs APP_CONFIG__DB__* in backend/.env.
init-db:
	cd backend && poetry run python -c "import asyncio; from backend.database.init_db import bootstrap; asyncio.run(bootstrap())"

# Bulk-import products/suppliers/associations from the METI article CSV (idempotent).
# Creates the new tables if missing; add TRUNCATE=1 to reload from scratch.
import-products:
	cd backend && poetry run python -m scripts.import_products --csv "$(CSV)" $(if $(TRUNCATE),--truncate,)

# Bulk-import EAN barcodes + product types from the EAN xlsx (idempotent).
# Requires `make import-products` first (EANs resolve to product.id via product.code).
import-ean:
	cd backend && poetry run python -m scripts.import_ean --xlsx "$(XLSX)" $(if $(TRUNCATE),--truncate,)

# FastAPI on :8004 → Swagger http://127.0.0.1:8004/docs (run from backend/)
run-backend:
	cd backend && poetry run uvicorn backend.main:app --host 127.0.0.1 --port 8004 --reload

# Vite on :8009 (vite.config.ts). Uses frontend/.env for VITE_BACKEND_API_URL.
run-frontend:
	cd frontend && npm run dev -- --host 127.0.0.1
