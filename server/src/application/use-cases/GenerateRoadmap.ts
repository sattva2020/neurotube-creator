import type { IAiService } from '../../domain/ports/IAiService.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GenerateRoadmap');

export class GenerateRoadmap {
  constructor(private aiService: IAiService) {}

  async execute(videoTitle: string, niche: Niche): Promise<string | null> {
    const start = Date.now();
    logger.debug('execute() called', { videoTitle, niche });

    try {
      const roadmap = await this.aiService.generateContentRoadmap(videoTitle, niche);

      const elapsed = Date.now() - start;
      if (roadmap) {
        logger.info('execute() completed', { videoTitle, niche, elapsed, resultLength: roadmap.length });
      } else {
        logger.warn('execute() returned null', { videoTitle, niche, elapsed });
      }

      return roadmap;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { videoTitle, niche, elapsed, error: String(error) });
      throw error;
    }
  }
}
