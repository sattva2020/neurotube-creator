#!/bin/sh
set -e

echo "[Entrypoint] Running database migrations..."

cd /app/server
npx drizzle-kit migrate

echo "[Entrypoint] Migrations complete."

# One-time cleanup: remove test user created during deployment verification
echo "[Entrypoint] Cleaning up test data..."
cd /app
node --input-type=module -e "
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
try {
  await sql\`DELETE FROM sessions WHERE user_id = '710a830d-e7db-484b-911f-0d4b8e2b4546'\`;
  await sql\`DELETE FROM activity_logs WHERE user_id = '710a830d-e7db-484b-911f-0d4b8e2b4546'\`;
  const r = await sql\`DELETE FROM users WHERE id = '710a830d-e7db-484b-911f-0d4b8e2b4546'\`;
  console.log('[Cleanup] Deleted test user rows:', r.count);
} catch(e) { console.log('[Cleanup] skipped:', e.message); }
await sql.end();
"

echo "[Entrypoint] Starting server..."
exec node server/dist/index.js
