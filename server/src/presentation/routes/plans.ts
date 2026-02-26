import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GeneratePlan } from '../../application/use-cases/GeneratePlan.js';
import type { ExportPlan } from '../../application/use-cases/ExportPlan.js';
import type { IPlanRepository } from '../../domain/ports/IPlanRepository.js';
import type { Niche } from '../../domain/entities/Niche.js';
import type { ExportFormat } from '@neurotube/shared/export';
import type { AuthVariables } from '../middleware/authMiddleware.js';
import { generatePlanSchema, listPlansQuerySchema, uuidParamSchema, exportPlanQuerySchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('PlansRoute');

export function plansRoutes(generatePlan: GeneratePlan, planRepo: IPlanRepository, exportPlan: ExportPlan) {
  const app = new Hono<{ Variables: AuthVariables }>();

  app.post('/generate', zValidator('json', generatePlanSchema), async (c) => {
    const { title, hook, niche } = c.req.valid('json');
    const { userId } = c.get('user');
    logger.debug('POST /api/plans/generate', { title, hook, niche, userId });

    const plan = await generatePlan.execute(title, hook, niche, userId);
    logger.info('Plan generated', { title, niche, planId: plan.id, userId });

    return c.json({ data: plan });
  });

  app.get('/:id/export', zValidator('param', uuidParamSchema), zValidator('query', exportPlanQuerySchema), async (c) => {
    const { id } = c.req.valid('param');
    const { format } = c.req.valid('query');
    const { userId } = c.get('user');
    logger.debug('GET /api/plans/:id/export', { id, format, userId });

    try {
      const result = await exportPlan.execute(id, format as ExportFormat, userId);
      logger.info('Plan exported', { id, format, filename: result.filename, bytes: result.buffer.byteLength });

      c.header('Content-Type', result.contentType);
      c.header('Content-Disposition', `attachment; filename="${result.filename}"`);
      c.header('Content-Length', result.buffer.byteLength.toString());

      return c.body(result.buffer);
    } catch (error) {
      if (error instanceof Error && error.message === 'Plan not found') {
        logger.info('Plan not found for export', { id, userId });
        return c.json({ error: 'Plan not found' }, 404);
      }
      throw error;
    }
  });

  app.get('/:id', zValidator('param', uuidParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const { userId } = c.get('user');
    logger.debug('GET /api/plans/:id', { id, userId });

    const plan = await planRepo.findById(id, userId);
    if (!plan) {
      logger.info('Plan not found', { id, userId });
      return c.json({ error: 'Plan not found' }, 404);
    }

    logger.info('Plan fetched', { id, title: plan.title });
    return c.json({ data: plan });
  });

  app.delete('/:id', zValidator('param', uuidParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const { userId } = c.get('user');
    logger.debug('DELETE /api/plans/:id', { id, userId });

    await planRepo.delete(id, userId);
    logger.info('Plan deleted', { id, userId });

    return c.json({ success: true });
  });

  app.get('/', zValidator('query', listPlansQuerySchema), async (c) => {
    const { niche } = c.req.valid('query');
    const { userId } = c.get('user');
    logger.debug('GET /api/plans', { userId, niche: niche ?? 'all' });

    const plans = await planRepo.findAll(userId, niche as Niche | undefined);
    logger.info('Plans listed', { count: plans.length, userId, niche: niche ?? 'all' });

    return c.json({ data: plans });
  });

  return app;
}
