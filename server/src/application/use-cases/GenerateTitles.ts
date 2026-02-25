import type { IAiService } from '../../domain/ports/IAiService.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GenerateTitles');

export class GenerateTitles {
  constructor(private aiService: IAiService) {}

  async execute(titleIdea: string): Promise<string[]> {
    const start = Date.now();
    logger.debug('execute() called', { titleIdea });

    try {
      const titles = await this.aiService.generateTitles(titleIdea);

      const elapsed = Date.now() - start;
      logger.info('execute() completed', { titleIdea, count: titles.length, elapsed });

      return titles;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { titleIdea, elapsed, error: String(error) });
      throw error;
    }
  }
}
