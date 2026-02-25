import type { IAiService } from '../../domain/ports/IAiService.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('AnalyzeNiche');

export class AnalyzeNiche {
  constructor(private aiService: IAiService) {}

  async execute(videoTitle: string, niche: Niche): Promise<string | null> {
    const start = Date.now();
    logger.debug('execute() called', { videoTitle, niche });

    try {
      const analysis = await this.aiService.analyzeNiche(videoTitle, niche);

      const elapsed = Date.now() - start;
      if (analysis) {
        logger.info('execute() completed', { videoTitle, niche, elapsed, resultLength: analysis.length });
      } else {
        logger.warn('execute() returned null', { videoTitle, niche, elapsed });
      }

      return analysis;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { videoTitle, niche, elapsed, error: String(error) });
      throw error;
    }
  }
}
