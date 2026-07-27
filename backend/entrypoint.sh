#!/bin/bash
set -e

# JWT keys are only needed once real auth is wired; harmless to pre-generate.
# They are regenerated on every container recreate (they are not in a volume),
# so any token issued before a `docker compose up --build` stops validating —
# just log in again.
bash ./generate_keys.sh || echo "key generation skipped"

echo "Initializing database (create_all if tables don't exist)..."
poetry run python -c "import asyncio; from backend.database.init_db import bootstrap; asyncio.run(bootstrap())"

# compose bind-mounts ./backend/backend, so --reload picks up host edits.
# Windows bind mounts deliver no inotify events, hence WATCHFILES_FORCE_POLLING
# (set in docker-compose.yml) — without it the watcher sees nothing.
RELOAD_FLAG=""
if [ "${APP_CONFIG__RUN__RELOAD,,}" = "true" ]; then
  RELOAD_FLAG="--reload"
fi

echo "Starting ProductPromo API${RELOAD_FLAG:+ (auto-reload)}..."
exec poetry run uvicorn backend.main:app \
  --host "${APP_CONFIG__RUN__HOST:-0.0.0.0}" \
  --port "${APP_CONFIG__RUN__PORT:-8004}" \
  ${RELOAD_FLAG}
