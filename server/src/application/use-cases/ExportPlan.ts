import type { IPlanRepository } from '../../domain/ports/IPlanRepository.js';
import type { IDocumentExporter } from '../../domain/ports/IDocumentExporter.js';
import type { ExportFormat, ExportResult } from '../../../../shared/types/export.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('ExportPlan');

export class ExportPlan {
  constructor(
    private planRepo: IPlanRepository,
    private documentExporter: IDocumentExporter,
  ) {}

  async execute(planId: string, format: ExportFormat, userId: string): Promise<ExportResult> {
    const start = Date.now();
    logger.debug('execute() called', { planId, format, userId });

    try {
      const plan = await this.planRepo.findById(planId, userId);

      if (!plan) {
        logger.warn('Plan not found', { planId, userId });
        throw new Error('Plan not found');
      }

      logger.debug('Plan fetched', {
        planId: plan.id,
        title: plan.title,
        markdownLength: plan.markdown.length,
      });

      const result = await this.documentExporter.export(
        plan.markdown,
        plan.title,
        plan.niche,
        format,
        plan.createdAt instanceof Date ? plan.createdAt.toISOString() : plan.createdAt,
      );

      const elapsed = Date.now() - start;
      logger.info('execute() completed', {
        planId,
        format,
        filename: result.filename,
        bytes: result.buffer.byteLength,
        elapsed,
      });

      return result;
    } catch (error) {
      const elapsed = Date.now() - start;
      logger.error('execute() failed', { planId, format, elapsed, error: String(error) });
      throw error;
    }
  }
}
