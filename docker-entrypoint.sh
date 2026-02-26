#!/bin/sh
set -e

echo "[Entrypoint] Running database migrations..."

cd /app/server
npx drizzle-kit migrate

echo "[Entrypoint] Migrations complete."

# One-time cleanup: remove test user created during deployment verification
cd /app
node scripts/cleanup-test-user.mjs || true

echo "[Entrypoint] Starting server..."
exec node server/dist/index.js
