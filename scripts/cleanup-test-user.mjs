import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);
try {
  await sql`DELETE FROM sessions WHERE user_id = '710a830d-e7db-484b-911f-0d4b8e2b4546'`;
  await sql`DELETE FROM activity_logs WHERE user_id = '710a830d-e7db-484b-911f-0d4b8e2b4546'`;
  const r = await sql`DELETE FROM users WHERE id = '710a830d-e7db-484b-911f-0d4b8e2b4546'`;
  console.log('[Cleanup] Deleted test user rows:', r.count);
} catch (e) {
  console.log('[Cleanup] skipped:', e.message);
}
await sql.end();
