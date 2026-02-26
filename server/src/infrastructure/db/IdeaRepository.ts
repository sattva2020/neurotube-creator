import { eq, desc, and, count as sqlCount } from 'drizzle-orm';
import type { IIdeaRepository } from '../../domain/ports/IIdeaRepository.js';
import type { VideoIdea } from '../../domain/entities/VideoIdea.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { ideas } from './schema.js';
import type { DbClient } from './client.js';
import { createLogger } from '../logger.js';

const logger = createLogger('IdeaRepository');

export class IdeaRepository implements IIdeaRepository {
  constructor(private db: DbClient) {}

  async saveMany(ideaList: VideoIdea[], topic: string, userId: string): Promise<VideoIdea[]> {
    const start = Date.now();
    logger.debug('saveMany() called', { count: ideaList.length, topic, userId });

    const rows = ideaList.map((idea) => ({
      userId,
      title: idea.title,
      hook: idea.hook,
      targetAudience: idea.targetAudience,
      whyItWorks: idea.whyItWorks,
      searchVolume: idea.searchVolume,
      primaryKeyword: idea.primaryKeyword,
      secondaryKeywords: idea.secondaryKeywords,
      niche: idea.niche,
      topic,
    }));

    const inserted = await this.db.insert(ideas).values(rows).returning();

    const result = inserted.map(this.toEntity);
    const elapsed = Date.now() - start;
    logger.info('saveMany() completed', { count: result.length, topic, userId, elapsed });
    return result;
  }

  async findAll(userId: string, niche?: Niche): Promise<VideoIdea[]> {
    const start = Date.now();
    logger.debug('findAll() called', { userId, niche: niche ?? 'all' });

    const conditions = niche
      ? and(eq(ideas.userId, userId), eq(ideas.niche, niche))
      : eq(ideas.userId, userId);

    const rows = await this.db
      .select()
      .from(ideas)
      .where(conditions)
      .orderBy(desc(ideas.createdAt));

    const result = rows.map(this.toEntity);
    const elapsed = Date.now() - start;
    logger.info('findAll() completed', { count: result.length, userId, niche: niche ?? 'all', elapsed });
    return result;
  }

  async findById(id: string, userId?: string): Promise<VideoIdea | null> {
    const start = Date.now();
    logger.debug('findById() called', { id, userId });

    const conditions = userId
      ? and(eq(ideas.id, id), eq(ideas.userId, userId))
      : eq(ideas.id, id);

    const [row] = await this.db
      .select()
      .from(ideas)
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
      ? and(eq(ideas.id, id), eq(ideas.userId, userId))
      : eq(ideas.id, id);

    await this.db.delete(ideas).where(conditions);

    const elapsed = Date.now() - start;
    logger.info('delete() completed', { id, userId, elapsed });
  }

  async countAll(): Promise<number> {
    const start = Date.now();
    logger.debug('countAll() called');

    const [row] = await this.db
      .select({ value: sqlCount() })
      .from(ideas);

    const total = Number(row.value);
    const elapsed = Date.now() - start;
    logger.info('countAll() completed', { total, elapsed });
    return total;
  }

  private toEntity(row: typeof ideas.$inferSelect): VideoIdea {
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      hook: row.hook,
      targetAudience: row.targetAudience,
      whyItWorks: row.whyItWorks,
      searchVolume: row.searchVolume as VideoIdea['searchVolume'],
      primaryKeyword: row.primaryKeyword,
      secondaryKeywords: row.secondaryKeywords,
      niche: row.niche as Niche,
      createdAt: row.createdAt,
    };
  }
}
