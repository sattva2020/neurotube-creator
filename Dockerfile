# ---- Base ----
FROM node:22-slim AS base
WORKDIR /app

ARG VERSION=dev
ARG COMMIT=unknown

LABEL org.opencontainers.image.title="neurotube-creator"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.revision="${COMMIT}"
LABEL org.opencontainers.image.source="https://github.com/neurotube/creator"

# ---- Dependencies ----
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN npm ci

# ---- Build shared types ----
FROM deps AS build-shared
COPY shared/ ./shared/
COPY tsconfig.base.json ./
RUN npm run build:shared

# ---- Build server ----
FROM build-shared AS build-server
COPY server/src/ ./server/src/
COPY server/tsconfig.json ./server/
RUN npm run build:server

# ---- Build client ----
FROM build-shared AS build-client
COPY client/ ./client/
RUN npm run build:client

# ---- Production ----
FROM node:22-slim AS production
WORKDIR /app

ARG VERSION=dev
ARG COMMIT=unknown
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies + drizzle-kit for migrations
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN npm ci --omit=dev && npm install -w @neurotube/server drizzle-kit

# Copy built artifacts
COPY --from=build-server /app/server/dist/ ./server/dist/
COPY --from=build-client /app/client/dist/ ./client/dist/
COPY --from=build-shared /app/shared/dist/ ./shared/dist/

# Copy Drizzle migrations and config
COPY server/drizzle/ ./server/drizzle/
COPY server/drizzle.config.ts ./server/

# Copy entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
