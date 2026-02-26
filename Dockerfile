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

# ---- Production ----
FROM node:22-slim AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies + drizzle-kit for migrations
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN npm ci --omit=dev && npm install -w @neurotube/server drizzle-kit

# Copy built artifacts
COPY --from=builder /app/server/dist/ ./server/dist/
COPY --from=builder /app/client/dist/ ./client/dist/
COPY --from=builder /app/shared/dist/ ./shared/dist/

# Copy Drizzle migrations and config
COPY server/drizzle/ ./server/drizzle/
COPY server/drizzle.config.ts ./server/

# Copy entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
