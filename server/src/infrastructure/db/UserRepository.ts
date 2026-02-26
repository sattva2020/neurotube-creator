import { eq, desc, count as sqlCount, and, gte } from 'drizzle-orm';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { User } from '../../domain/entities/User.js';
import type { Role } from '../../domain/entities/Role.js';
import { users } from './schema.js';
import type { DbClient } from './client.js';
import { createLogger } from '../logger.js';

const logger = createLogger('UserRepository');

export class UserRepository implements IUserRepository {
  constructor(private db: DbClient) {}

  async save(user: User): Promise<User> {
    const start = Date.now();
    logger.debug('save() called', { email: user.email, role: user.role });

    const [row] = await this.db
      .insert(users)
      .values({
        email: user.email,
        displayName: user.displayName,
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
      })
      .returning();

    const elapsed = Date.now() - start;
    logger.info('save() completed', { id: row.id, email: row.email, elapsed });
    return this.toEntity(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const start = Date.now();
    logger.debug('findByEmail() called', { email });

    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const elapsed = Date.now() - start;
    if (!row) {
      logger.info('findByEmail() not found', { email, elapsed });
      return null;
    }

    logger.info('findByEmail() found', { id: row.id, email: row.email, elapsed });
    return this.toEntity(row);
  }

  async findById(id: string): Promise<User | null> {
    const start = Date.now();
    logger.debug('findById() called', { id });

    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const elapsed = Date.now() - start;
    if (!row) {
      logger.info('findById() not found', { id, elapsed });
      return null;
    }

    logger.info('findById() found', { id: row.id, email: row.email, elapsed });
    return this.toEntity(row);
  }

  async updateRole(id: string, role: Role): Promise<User | null> {
    const start = Date.now();
    logger.debug('updateRole() called', { id, role });

    const [row] = await this.db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    const elapsed = Date.now() - start;
    if (!row) {
      logger.info('updateRole() not found', { id, elapsed });
      return null;
    }

    logger.info('updateRole() completed', { id: row.id, role: row.role, elapsed });
    return this.toEntity(row);
  }

  async updatePassword(id: string, passwordHash: string): Promise<User | null> {
    const start = Date.now();
    logger.debug('updatePassword() called', { id });

    const [row] = await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    const elapsed = Date.now() - start;
    if (!row) {
      logger.info('updatePassword() not found', { id, elapsed });
      return null;
    }

    logger.info('updatePassword() completed', { id: row.id, elapsed });
    return this.toEntity(row);
  }

  async deactivate(id: string): Promise<User | null> {
    const start = Date.now();
    logger.debug('deactivate() called', { id });

    const [row] = await this.db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    const elapsed = Date.now() - start;
    if (!row) {
      logger.info('deactivate() not found', { id, elapsed });
      return null;
    }

    logger.info('deactivate() completed', { id: row.id, isActive: row.isActive, elapsed });
    return this.toEntity(row);
  }

  async findAll(): Promise<User[]> {
    const start = Date.now();
    logger.debug('findAll() called');

    const rows = await this.db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));

    const result = rows.map(this.toEntity);
    const elapsed = Date.now() - start;
    logger.info('findAll() completed', { count: result.length, elapsed });
    return result;
  }

  async count(): Promise<number> {
    const start = Date.now();
    logger.debug('count() called');

    const [row] = await this.db
      .select({ value: sqlCount() })
      .from(users);

    const total = Number(row.value);
    const elapsed = Date.now() - start;
    logger.info('count() completed', { total, elapsed });
    return total;
  }

  async countActive(): Promise<number> {
    const start = Date.now();
    logger.debug('countActive() called');

    const [row] = await this.db
      .select({ value: sqlCount() })
      .from(users)
      .where(eq(users.isActive, true));

    const total = Number(row.value);
    const elapsed = Date.now() - start;
    logger.info('countActive() completed', { total, elapsed });
    return total;
  }

  async countByRole(): Promise<Record<string, number>> {
    const start = Date.now();
    logger.debug('countByRole() called');

    const rows = await this.db
      .select({ role: users.role, value: sqlCount() })
      .from(users)
      .where(eq(users.isActive, true))
      .groupBy(users.role);

    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.role] = Number(row.value);
    }

    const elapsed = Date.now() - start;
    logger.info('countByRole() completed', { result, elapsed });
    return result;
  }

  async countSince(since: Date): Promise<number> {
    const start = Date.now();
    logger.debug('countSince() called', { since: since.toISOString() });

    const [row] = await this.db
      .select({ value: sqlCount() })
      .from(users)
      .where(and(gte(users.createdAt, since)));

    const total = Number(row.value);
    const elapsed = Date.now() - start;
    logger.info('countSince() completed', { total, elapsed });
    return total;
  }

  private toEntity(row: typeof users.$inferSelect): User {
    return {
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      passwordHash: row.passwordHash,
      role: row.role as Role,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
