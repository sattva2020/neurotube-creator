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

# Prune dev dependencies in-place
RUN npm prune --omit=dev

# ---- Production ----
FROM node:22-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests (needed for workspace resolution)
COPY package.json ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Copy pruned node_modules from builder (avoids second npm ci)
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/server/node_modules/ ./server/node_modules/

# Copy built artifacts
COPY --from=builder /app/server/dist/ ./server/dist/
COPY --from=builder /app/client/dist/ ./client/dist/
COPY --from=builder /app/shared/dist/ ./shared/dist/

# Copy Drizzle migrations and config
COPY server/drizzle/ ./server/drizzle/
COPY server/drizzle.config.ts ./server/

EXPOSE 3000
CMD ["node", "server/dist/index.js"]
