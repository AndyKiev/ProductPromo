FROM node:20-alpine

WORKDIR /app/frontend

COPY package.json package-lock.json* ./
RUN npm install

COPY . /app/frontend

ARG APP_MODE=development
ENV APP_MODE=${APP_MODE}

EXPOSE 8009
# dev server (HMR). For production, run `npm run build` and serve dist/ via nginx.
# --host 0.0.0.0 overrides vite.config.ts's 127.0.0.1, which would only be
# reachable from inside the container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8009"]
