FROM node:20-alpine

WORKDIR /app/frontend

COPY package.json ./
RUN npm install

COPY . /app/frontend

ARG APP_MODE=development
ENV APP_MODE=${APP_MODE}

EXPOSE 4000
# dev server (HMR). For production, run `npm run build` and serve dist/ via nginx.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4000"]
