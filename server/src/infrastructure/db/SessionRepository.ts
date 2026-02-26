import { eq, lt } from 'drizzle-orm';
import type { ISessionRepository } from '../../domain/ports/ISessionRepository.js';
import type { Session } from '../../domain/entities/Session.js';
import { sessions } from './schema.js';
import type { DbClient } from './client.js';
import { createLogger } from '../logger.js';

const logger = createLogger('SessionRepository');

export class SessionRepository implements ISessionRepository {
  constructor(private db: DbClient) {}

  async save(session: Session): Promise<Session> {
    const start = Date.now();
    logger.debug('save() called', { userId: session.userId });

    const [row] = await this.db
      .insert(sessions)
      .values({
        userId: session.userId,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        userAgent: session.userAgent ?? null,
        ipAddress: session.ipAddress ?? null,
      })
      .returning();

    const elapsed = Date.now() - start;
    logger.info('save() completed', { id: row.id, userId: row.userId, elapsed });
    return this.toEntity(row);
  }

  async findByToken(refreshToken: string): Promise<Session | null> {
    const start = Date.now();
    logger.debug('findByToken() called');

    const now = new Date();
    const [row] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshToken, refreshToken))
      .limit(1);

    const elapsed = Date.now() - start;
    if (!row) {
      logger.info('findByToken() not found', { elapsed });
      return null;
    }

    if (row.expiresAt <= now) {
      logger.info('findByToken() expired', { id: row.id, expiresAt: row.expiresAt.toISOString(), elapsed });
      return null;
    }

    logger.info('findByToken() found', { id: row.id, userId: row.userId, elapsed });
    return this.toEntity(row);
  }

  async deleteByToken(refreshToken: string): Promise<void> {
    const start = Date.now();
    logger.debug('deleteByToken() called');

    await this.db
      .delete(sessions)
      .where(eq(sessions.refreshToken, refreshToken));

    const elapsed = Date.now() - start;
    logger.info('deleteByToken() completed', { elapsed });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    const start = Date.now();
    logger.debug('deleteAllByUserId() called', { userId });

    await this.db
      .delete(sessions)
      .where(eq(sessions.userId, userId));

    const elapsed = Date.now() - start;
    logger.info('deleteAllByUserId() completed', { userId, elapsed });
  }

  async deleteExpired(): Promise<number> {
    const start = Date.now();
    logger.debug('deleteExpired() called');

    const now = new Date();
    const deleted = await this.db
      .delete(sessions)
      .where(lt(sessions.expiresAt, now))
      .returning();

    const elapsed = Date.now() - start;
    logger.info('deleteExpired() completed', { count: deleted.length, elapsed });
    return deleted.length;
  }

  private toEntity(row: typeof sessions.$inferSelect): Session {
    return {
      id: row.id,
      userId: row.userId,
      refreshToken: row.refreshToken,
      expiresAt: row.expiresAt,
      userAgent: row.userAgent ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      createdAt: row.createdAt,
    };
  }
}
