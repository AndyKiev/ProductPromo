#!/bin/bash
set -e

# JWT keys are only needed once real auth is wired; harmless to pre-generate.
bash ./generate_keys.sh || echo "key generation skipped"

echo "Initializing database (create_all if tables don't exist)..."
poetry run python -c "import asyncio; from backend.database.init_db import init_db, seed_status_types; asyncio.run(init_db()); asyncio.run(seed_status_types())"

echo "Starting ProductPromo API..."
exec poetry run uvicorn backend.main:app \
  --host "${APP_CONFIG__RUN__HOST:-0.0.0.0}" \
  --port "${APP_CONFIG__RUN__PORT:-8004}"
