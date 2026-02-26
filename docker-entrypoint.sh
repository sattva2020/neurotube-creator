#!/bin/sh
set -e

echo "[Entrypoint] Running database migrations..."

cd /app/server
npx drizzle-kit migrate

echo "[Entrypoint] Migrations complete. Starting server..."

cd /app
exec node server/dist/index.js
