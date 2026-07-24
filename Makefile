# Local dev (no docker). Requires poetry (backend), node 20+ (frontend),
# and a running PostgreSQL (e.g. the docker-compose postgres service or local install).

install-backend:
	cd backend && poetry install

install-frontend:
	cd frontend && npm install

# Create tables in the DB (idempotent). Need APP_CONFIG__DB__* in backend/.env.
init-db:
	cd backend && poetry run python -c "import asyncio; from backend.database.init_db import init_db; asyncio.run(init_db())"

# FastAPI on :8004 → Swagger http://127.0.0.1:8004/docs (run from backend/)
run-backend:
	cd backend && poetry run uvicorn backend.main:app --host 127.0.0.1 --port 8004 --reload

# Vite — port comes from vite.config.ts (default :8009). Set VITE_BACKEND_API_URL before calling.
run-frontend:
	cd frontend && npm run dev -- --host 127.0.0.1

# --- Docker helpers (no local Python/node needed) ---
run-postgres:
	docker compose up -d postgres
stop-postgres:
	docker compose stop postgres
