import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createLogger } from '../logger.js';
import * as schema from './schema.js';

const logger = createLogger('DbClient');

/**
 * Create a Drizzle ORM client backed by postgres.js driver.
 * Returns both the drizzle instance and the underlying sql client (for graceful shutdown).
 */
export function createDbClient(databaseUrl: string) {
  logger.debug('Creating postgres.js connection', { url: databaseUrl.replace(/\/\/.*@/, '//*****@') });

  const sql = postgres(databaseUrl);
  const db = drizzle(sql, { schema });

  logger.info('Database client created');

  return { db, sql };
}

export type DbClient = ReturnType<typeof createDbClient>['db'];
