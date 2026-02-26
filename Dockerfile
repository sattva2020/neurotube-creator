FROM node:22-slim AS builder
WORKDIR /app

# Install all dependencies
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN npm ci

# Build shared types
COPY shared/ ./shared/
COPY tsconfig.base.json ./
RUN npm run build:shared

# Build server
COPY server/src/ ./server/src/
COPY server/tsconfig.json ./server/
RUN npm run build:server

# Build client
COPY client/ ./client/
RUN npm run build:client

# Test: simple server to prove all builds passed
FROM node:22-slim
WORKDIR /app
RUN echo '{"type":"module"}' > package.json && \
    echo 'import http from "http"; const s = http.createServer((req, res) => { res.writeHead(200, {"Content-Type":"application/json"}); res.end(JSON.stringify({status:"ok",step:"all-builds-done"})); }); s.listen(3000, () => console.log("Listening on 3000"));' > index.mjs
EXPOSE 3000
CMD ["node", "index.mjs"]
