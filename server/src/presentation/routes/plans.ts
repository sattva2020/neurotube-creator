import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GeneratePlan } from '../../application/use-cases/GeneratePlan.js';
import type { IPlanRepository } from '../../domain/ports/IPlanRepository.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { generatePlanSchema, listPlansQuerySchema, uuidParamSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('PlansRoute');

export function plansRoutes(generatePlan: GeneratePlan, planRepo: IPlanRepository) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generatePlanSchema), async (c) => {
    const { title, hook, niche } = c.req.valid('json');
    logger.debug('POST /api/plans/generate', { title, hook, niche });

    const plan = await generatePlan.execute(title, hook, niche);
    logger.info('Plan generated', { title, niche, planId: plan.id });

    return c.json({ data: plan });
  });

  app.get('/:id', zValidator('param', uuidParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    logger.debug('GET /api/plans/:id', { id });

    const plan = await planRepo.findById(id);
    if (!plan) {
      logger.info('Plan not found', { id });
      return c.json({ error: 'Plan not found' }, 404);
    }

    logger.info('Plan fetched', { id, title: plan.title });
    return c.json({ data: plan });
  });

  app.delete('/:id', zValidator('param', uuidParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    logger.debug('DELETE /api/plans/:id', { id });

    await planRepo.delete(id);
    logger.info('Plan deleted', { id });

    return c.json({ success: true });
  });

  app.get('/', zValidator('query', listPlansQuerySchema), async (c) => {
    const { niche } = c.req.valid('query');
    logger.debug('GET /api/plans', { niche: niche ?? 'all' });

    const plans = await planRepo.findAll(niche as Niche | undefined);
    logger.info('Plans listed', { count: plans.length, niche: niche ?? 'all' });

    return c.json({ data: plans });
  });

  return app;
}
