FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VIRTUALENVS_CREATE=false

# build deps for aiomysql/cryptography
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential default-libmysqlclient-dev libpq-dev pkg-config openssl curl git openssh-client \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir "poetry>=2.0,<3.0"

WORKDIR /app/backend

# poetry.lock MUST be copied too: without it poetry re-resolves dependencies
# from the network on every build, and the result drifts (a fresh resolve
# dropped greenlet, which sqlalchemy's asyncio mode needs -> backend crash).
COPY pyproject.toml poetry.lock ./
# pp-common is a private git dependency: the build borrows the host's SSH key
# through BuildKit (compose `build.ssh`), it is never copied into the image.
RUN --mount=type=ssh mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts     && (poetry install --no-root --without dev || poetry install --no-root)

COPY . /app/backend

RUN chmod +x ./entrypoint.sh ./generate_keys.sh || true

ENTRYPOINT ["./entrypoint.sh"]
