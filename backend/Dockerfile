FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VIRTUALENVS_CREATE=false

# build deps for aiomysql/cryptography
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential default-libmysqlclient-dev libpq-dev pkg-config openssl curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir "poetry>=2.0,<3.0"

WORKDIR /app/backend

COPY pyproject.toml ./
RUN poetry install --no-root --without dev || poetry install --no-root

COPY . /app/backend

RUN chmod +x ./entrypoint.sh ./generate_keys.sh || true

ENTRYPOINT ["./entrypoint.sh"]
