import type { IAiService } from '../../domain/ports/IAiService.js';
import type { IIdeaRepository } from '../../domain/ports/IIdeaRepository.js';
import type { VideoIdea } from '../../domain/entities/VideoIdea.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GenerateIdeas');

export class GenerateIdeas {
  constructor(
    private aiService: IAiService,
    private ideaRepo: IIdeaRepository,
  ) {}

  async execute(topic: string, niche: Niche, userId: string): Promise<VideoIdea[]> {
    const start = Date.now();
    logger.debug('execute() called', { topic, niche, userId });

    try {
      const ideas = await this.aiService.generateIdeas(topic, niche);
      logger.debug('AI returned ideas', { count: ideas.length });

      const saved = await this.ideaRepo.saveMany(ideas, topic, userId);
      logger.debug('Ideas persisted', { count: saved.length });

      const elapsed = Date.now() - start;
      logger.info('execute() completed', { topic, niche, count: saved.length, elapsed });

      return saved;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { topic, niche, elapsed, error: String(error) });
      throw error;
    }
  }
}
