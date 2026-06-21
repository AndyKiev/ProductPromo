# Local dev (no docker). Requires poetry (backend) and node 20+ (frontend).

install-backend:
	cd backend && poetry install

install-frontend:
	cd frontend && npm install

# FastAPI on :8004 (run from backend/ so the `backend` package resolves)
run-backend:
	cd backend && poetry run uvicorn backend.main:app --host 127.0.0.1 --port 8004 --reload

# Vite on :4000, pointed straight at the backend
run-frontend:
	cd frontend && export VITE_BACKEND_API_URL=http://127.0.0.1:8004 && npm run dev -- --host 127.0.0.1
