import type { IAiService } from '../../domain/ports/IAiService.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GenerateSunoPrompt');

export class GenerateSunoPrompt {
  constructor(private aiService: IAiService) {}

  async execute(videoTitle: string, planMarkdown: string): Promise<string | null> {
    const start = Date.now();
    logger.debug('execute() called', { videoTitle, planLength: planMarkdown.length });

    try {
      const prompt = await this.aiService.generateSunoPrompt(videoTitle, planMarkdown);

      const elapsed = Date.now() - start;
      if (prompt) {
        logger.info('execute() completed', { videoTitle, elapsed, resultLength: prompt.length });
      } else {
        logger.warn('execute() returned null', { videoTitle, elapsed });
      }

      return prompt;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { videoTitle, elapsed, error: String(error) });
      throw error;
    }
  }
}
