import { eq, desc } from 'drizzle-orm';
import type { IIdeaRepository } from '../../domain/ports/IIdeaRepository.js';
import type { VideoIdea } from '../../domain/entities/VideoIdea.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { ideas } from './schema.js';
import type { DbClient } from './client.js';
import { createLogger } from '../logger.js';

const logger = createLogger('IdeaRepository');

export class IdeaRepository implements IIdeaRepository {
  constructor(private db: DbClient) {}

  async saveMany(ideaList: VideoIdea[], topic: string): Promise<VideoIdea[]> {
    const start = Date.now();
    logger.debug('saveMany() called', { count: ideaList.length, topic });

    const rows = ideaList.map((idea) => ({
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
    logger.info('saveMany() completed', { count: result.length, topic, elapsed });
    return result;
  }

  async findAll(niche?: Niche): Promise<VideoIdea[]> {
    const start = Date.now();
    logger.debug('findAll() called', { niche: niche ?? 'all' });

    const query = this.db.select().from(ideas).orderBy(desc(ideas.createdAt));
    const rows = niche
      ? await query.where(eq(ideas.niche, niche))
      : await query;

    const result = rows.map(this.toEntity);
    const elapsed = Date.now() - start;
    logger.info('findAll() completed', { count: result.length, niche: niche ?? 'all', elapsed });
    return result;
  }

  private toEntity(row: typeof ideas.$inferSelect): VideoIdea {
    return {
      id: row.id,
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
