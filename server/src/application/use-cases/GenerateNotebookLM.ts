import type { IAiService } from '../../domain/ports/IAiService.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GenerateNotebookLM');

export class GenerateNotebookLM {
  constructor(private aiService: IAiService) {}

  async execute(videoTitle: string, planMarkdown: string, niche: Niche): Promise<string | null> {
    const start = Date.now();
    logger.debug('execute() called', { videoTitle, niche, planLength: planMarkdown.length });

    try {
      const source = await this.aiService.generateNotebookLMSource(videoTitle, planMarkdown, niche);

      const elapsed = Date.now() - start;
      if (source) {
        logger.info('execute() completed', { videoTitle, niche, elapsed, resultLength: source.length });
      } else {
        logger.warn('execute() returned null', { videoTitle, niche, elapsed });
      }

      return source;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { videoTitle, niche, elapsed, error: String(error) });
      throw error;
    }
  }
}
