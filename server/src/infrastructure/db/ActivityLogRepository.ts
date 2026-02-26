import { eq, desc, count as sqlCount, and, type SQL } from 'drizzle-orm';
import type { IActivityLogRepository, ActivityLogFilters } from '../../domain/ports/IActivityLogRepository.js';
import type { ActivityLog } from '../../domain/entities/ActivityLog.js';
import { activityLogs } from './schema.js';
import type { DbClient } from './client.js';
import { createLogger } from '../logger.js';

const logger = createLogger('ActivityLogRepository');

export class ActivityLogRepository implements IActivityLogRepository {
  constructor(private db: DbClient) {}

  async save(log: ActivityLog): Promise<ActivityLog> {
    const start = Date.now();
    logger.debug('save() called', { userId: log.userId, action: log.action });

    const [row] = await this.db
      .insert(activityLogs)
      .values({
        userId: log.userId,
        action: log.action,
        resourceType: log.resourceType ?? null,
        resourceId: log.resourceId ?? null,
        metadata: log.metadata ?? null,
        ipAddress: log.ipAddress ?? null,
      })
      .returning();

    const elapsed = Date.now() - start;
    logger.info('save() completed', { id: row.id, action: row.action, elapsed });
    return this.toEntity(row);
  }

  async findAll(filters?: ActivityLogFilters, limit = 50, offset = 0): Promise<ActivityLog[]> {
    const start = Date.now();
    logger.debug('findAll() called', { filters, limit, offset });

    const conditions = this.buildConditions(filters);

    const query = this.db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const rows = conditions
      ? await query.where(conditions)
      : await query;

    const result = rows.map(this.toEntity);
    const elapsed = Date.now() - start;
    logger.info('findAll() completed', { count: result.length, elapsed });
    return result;
  }

  async count(filters?: ActivityLogFilters): Promise<number> {
    const start = Date.now();
    logger.debug('count() called', { filters });

    const conditions = this.buildConditions(filters);

    const query = this.db
      .select({ value: sqlCount() })
      .from(activityLogs);

    const [row] = conditions
      ? await query.where(conditions)
      : await query;

    const total = Number(row.value);
    const elapsed = Date.now() - start;
    logger.info('count() completed', { total, elapsed });
    return total;
  }

  private buildConditions(filters?: ActivityLogFilters): SQL | undefined {
    if (!filters) return undefined;

    const parts: SQL[] = [];
    if (filters.userId) parts.push(eq(activityLogs.userId, filters.userId));
    if (filters.action) parts.push(eq(activityLogs.action, filters.action));

    if (parts.length === 0) return undefined;
    if (parts.length === 1) return parts[0];
    return and(...parts);
  }

  private toEntity(row: typeof activityLogs.$inferSelect): ActivityLog {
    return {
      id: row.id,
      userId: row.userId,
      action: row.action,
      resourceType: row.resourceType ?? undefined,
      resourceId: row.resourceId ?? undefined,
      metadata: (row.metadata as Record<string, unknown>) ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      createdAt: row.createdAt,
    };
  }
}
