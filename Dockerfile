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

# Wrapper: catch startup errors, keep container alive for diagnostics
CMD ["node", "-e", "\
process.on('uncaughtException', e => { console.error('FATAL:', e); });\
process.on('unhandledRejection', e => { console.error('UNHANDLED:', e); });\
console.log('Starting server...');\
console.log('ENV check:', { NODE_ENV: process.env.NODE_ENV, PORT: process.env.PORT, HAS_DB: !!process.env.DATABASE_URL, HAS_GEMINI: !!process.env.GEMINI_API_KEY, HAS_JWT: !!process.env.JWT_SECRET });\
import('./server/dist/index.js').catch(e => { console.error('IMPORT FAILED:', e); process.exit(1); });\
"]
