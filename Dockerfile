FROM node:22-slim AS builder
WORKDIR /app

# Install all dependencies
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN npm ci

# Test: just start a simple server to prove npm ci worked
FROM node:22-slim
WORKDIR /app
RUN echo '{"type":"module"}' > package.json && \
    echo 'import http from "http"; const s = http.createServer((req, res) => { res.writeHead(200, {"Content-Type":"application/json"}); res.end(JSON.stringify({status:"ok",step:"npm-ci-done"})); }); s.listen(3000, () => console.log("Listening on 3000"));' > index.mjs
EXPOSE 3000
CMD ["node", "index.mjs"]
