#!/bin/bash
set -e

# JWT keys are only needed once real auth is wired; harmless to pre-generate.
bash ./generate_keys.sh || echo "key generation skipped"

echo "Starting ProductPromo API..."
exec poetry run uvicorn backend.main:app \
  --host "${APP_CONFIG__RUN__HOST:-0.0.0.0}" \
  --port "${APP_CONFIG__RUN__PORT:-8004}"
