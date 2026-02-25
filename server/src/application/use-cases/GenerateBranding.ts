import type { IAiService } from '../../domain/ports/IAiService.js';
import type { ChannelBranding } from '../../domain/entities/ChannelBranding.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GenerateBranding');

export class GenerateBranding {
  constructor(private aiService: IAiService) {}

  async execute(videoTitle: string, niche: Niche): Promise<ChannelBranding | null> {
    const start = Date.now();
    logger.debug('execute() called', { videoTitle, niche });

    try {
      const branding = await this.aiService.generateBranding(videoTitle, niche);

      const elapsed = Date.now() - start;
      if (branding) {
        logger.info('execute() completed', { videoTitle, niche, elapsed });
      } else {
        logger.warn('execute() returned null', { videoTitle, niche, elapsed });
      }

      return branding;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { videoTitle, niche, elapsed, error: String(error) });
      throw error;
    }
  }
}
