FROM node:22-slim
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

# Copy Drizzle migrations and config
COPY server/drizzle/ ./server/drizzle/
COPY server/drizzle.config.ts ./server/

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/dist/index.js"]
