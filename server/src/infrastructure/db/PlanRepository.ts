import { eq, desc } from 'drizzle-orm';
import type { IPlanRepository } from '../../domain/ports/IPlanRepository.js';
import type { VideoPlan } from '../../domain/entities/VideoPlan.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { plans } from './schema.js';
import type { DbClient } from './client.js';
import { createLogger } from '../logger.js';

const logger = createLogger('PlanRepository');

export class PlanRepository implements IPlanRepository {
  constructor(private db: DbClient) {}

  async save(plan: VideoPlan): Promise<VideoPlan> {
    const start = Date.now();
    logger.debug('save() called', { title: plan.title, niche: plan.niche });

    const [inserted] = await this.db
      .insert(plans)
      .values({
        ideaId: plan.ideaId ?? null,
        title: plan.title,
        markdown: plan.markdown,
        niche: plan.niche,
      })
      .returning();

    const result = this.toEntity(inserted);
    const elapsed = Date.now() - start;
    logger.info('save() completed', { id: result.id, title: result.title, elapsed });
    return result;
  }

  async findAll(niche?: Niche): Promise<VideoPlan[]> {
    const start = Date.now();
    logger.debug('findAll() called', { niche: niche ?? 'all' });

    const query = this.db.select().from(plans).orderBy(desc(plans.createdAt));
    const rows = niche
      ? await query.where(eq(plans.niche, niche))
      : await query;

    const result = rows.map(this.toEntity);
    const elapsed = Date.now() - start;
    logger.info('findAll() completed', { count: result.length, niche: niche ?? 'all', elapsed });
    return result;
  }

  private toEntity(row: typeof plans.$inferSelect): VideoPlan {
    return {
      id: row.id,
      ideaId: row.ideaId ?? undefined,
      title: row.title,
      markdown: row.markdown,
      niche: row.niche as Niche,
      createdAt: row.createdAt,
    };
  }
}
