# syntax=docker/dockerfile:1
FROM node:22-slim

# node:22-slim (glibc, like WSL where package-lock.json is made; alpine/musl misses native modules).
# git + ssh: the shared UI kit (@catalog/ui) is a private git dependency.
RUN apt-get update && apt-get install -y --no-install-recommends git openssh-client ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
# The build borrows the host's SSH key through BuildKit (compose `build.ssh`); it is never copied into the image.
RUN --mount=type=ssh mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null \
    && npm install

COPY . /app

EXPOSE 8009
# Dev server (HMR). --host 0.0.0.0 overrides vite.config.ts's 127.0.0.1, which would only be
# reachable from inside the container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8009"]
