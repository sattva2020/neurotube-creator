import type { IAiService } from '../../domain/ports/IAiService.js';
import type { IPlanRepository } from '../../domain/ports/IPlanRepository.js';
import type { VideoPlan } from '../../domain/entities/VideoPlan.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GeneratePlan');

export class GeneratePlan {
  constructor(
    private aiService: IAiService,
    private planRepo: IPlanRepository,
  ) {}

  async execute(title: string, hook: string, niche: Niche): Promise<VideoPlan> {
    const start = Date.now();
    logger.debug('execute() called', { title, hook, niche });

    try {
      const markdown = await this.aiService.generatePlan(title, hook, niche);
      logger.debug('AI returned plan', { markdownLength: markdown.length });

      const plan: VideoPlan = {
        title,
        markdown,
        niche,
        createdAt: new Date(),
      };

      const saved = await this.planRepo.save(plan);
      logger.debug('Plan persisted', { id: saved.id });

      const elapsed = Date.now() - start;
      logger.info('execute() completed', { title, niche, elapsed });

      return saved;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { title, niche, elapsed, error: String(error) });
      throw error;
    }
  }
}
