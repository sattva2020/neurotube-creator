import { eq, desc, and, count as sqlCount } from 'drizzle-orm';
import type { IPlanRepository } from '../../domain/ports/IPlanRepository.js';
import type { VideoPlan } from '../../domain/entities/VideoPlan.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { plans } from './schema.js';
import type { DbClient } from './client.js';
import { createLogger } from '../logger.js';

const logger = createLogger('PlanRepository');

export class PlanRepository implements IPlanRepository {
  constructor(private db: DbClient) {}

  async save(plan: VideoPlan, userId: string): Promise<VideoPlan> {
    const start = Date.now();
    logger.debug('save() called', { title: plan.title, niche: plan.niche, userId });

    const [inserted] = await this.db
      .insert(plans)
      .values({
        userId,
        ideaId: plan.ideaId ?? null,
        title: plan.title,
        markdown: plan.markdown,
        niche: plan.niche,
      })
      .returning();

    const result = this.toEntity(inserted);
    const elapsed = Date.now() - start;
    logger.info('save() completed', { id: result.id, title: result.title, userId, elapsed });
    return result;
  }

  async findAll(userId: string, niche?: Niche): Promise<VideoPlan[]> {
    const start = Date.now();
    logger.debug('findAll() called', { userId, niche: niche ?? 'all' });

    const conditions = niche
      ? and(eq(plans.userId, userId), eq(plans.niche, niche))
      : eq(plans.userId, userId);

    const rows = await this.db
      .select()
      .from(plans)
      .where(conditions)
      .orderBy(desc(plans.createdAt));

    const result = rows.map(this.toEntity);
    const elapsed = Date.now() - start;
    logger.info('findAll() completed', { count: result.length, userId, niche: niche ?? 'all', elapsed });
    return result;
  }

  async findById(id: string, userId?: string): Promise<VideoPlan | null> {
    const start = Date.now();
    logger.debug('findById() called', { id, userId });

    const conditions = userId
      ? and(eq(plans.id, id), eq(plans.userId, userId))
      : eq(plans.id, id);

    const [row] = await this.db
      .select()
      .from(plans)
      .where(conditions)
      .limit(1);

    const elapsed = Date.now() - start;
    if (!row) {
      logger.info('findById() not found', { id, userId, elapsed });
      return null;
    }

    logger.info('findById() found', { id, title: row.title, elapsed });
    return this.toEntity(row);
  }

  async delete(id: string, userId?: string): Promise<void> {
    const start = Date.now();
    logger.debug('delete() called', { id, userId });

    const conditions = userId
      ? and(eq(plans.id, id), eq(plans.userId, userId))
      : eq(plans.id, id);

    await this.db.delete(plans).where(conditions);

    const elapsed = Date.now() - start;
    logger.info('delete() completed', { id, userId, elapsed });
  }

  async countAll(): Promise<number> {
    const start = Date.now();
    logger.debug('countAll() called');

    const [row] = await this.db
      .select({ value: sqlCount() })
      .from(plans);

    const total = Number(row.value);
    const elapsed = Date.now() - start;
    logger.info('countAll() completed', { total, elapsed });
    return total;
  }

  private toEntity(row: typeof plans.$inferSelect): VideoPlan {
    return {
      id: row.id,
      userId: row.userId,
      ideaId: row.ideaId ?? undefined,
      title: row.title,
      markdown: row.markdown,
      niche: row.niche as Niche,
      createdAt: row.createdAt,
    };
  }
}
