import type { IAiService } from '../../domain/ports/IAiService.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GenerateMonetization');

export class GenerateMonetization {
  constructor(private aiService: IAiService) {}

  async execute(videoTitle: string, niche: Niche): Promise<string | null> {
    const start = Date.now();
    logger.debug('execute() called', { videoTitle, niche });

    try {
      const copy = await this.aiService.generateMonetizationCopy(videoTitle, niche);

      const elapsed = Date.now() - start;
      if (copy) {
        logger.info('execute() completed', { videoTitle, niche, elapsed, resultLength: copy.length });
      } else {
        logger.warn('execute() returned null', { videoTitle, niche, elapsed });
      }

      return copy;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { videoTitle, niche, elapsed, error: String(error) });
      throw error;
    }
  }
}
