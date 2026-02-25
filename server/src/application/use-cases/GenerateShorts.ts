import type { IAiService } from '../../domain/ports/IAiService.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GenerateShorts');

export class GenerateShorts {
  constructor(private aiService: IAiService) {}

  async execute(videoTitle: string, planMarkdown: string): Promise<string | null> {
    const start = Date.now();
    logger.debug('execute() called', { videoTitle, planLength: planMarkdown.length });

    try {
      const shorts = await this.aiService.generateShortsSpinoffs(videoTitle, planMarkdown);

      const elapsed = Date.now() - start;
      if (shorts) {
        logger.info('execute() completed', { videoTitle, elapsed, resultLength: shorts.length });
      } else {
        logger.warn('execute() returned null', { videoTitle, elapsed });
      }

      return shorts;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { videoTitle, elapsed, error: String(error) });
      throw error;
    }
  }
}
