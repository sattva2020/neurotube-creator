import type { IAiService } from '../../domain/ports/IAiService.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GenerateThumbnail');

export class GenerateThumbnail {
  constructor(private aiService: IAiService) {}

  async execute(prompt: string): Promise<string | null> {
    const start = Date.now();
    logger.debug('execute() called', { promptLength: prompt.length });

    try {
      const dataUrl = await this.aiService.generateThumbnail(prompt);

      const elapsed = Date.now() - start;
      if (dataUrl) {
        logger.info('execute() completed', { elapsed, dataUrlLength: dataUrl.length });
      } else {
        logger.warn('execute() returned null', { elapsed });
      }

      return dataUrl;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { elapsed, error: String(error) });
      throw error;
    }
  }
}
