import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GeneratePlan } from '../../application/use-cases/GeneratePlan.js';
import type { IPlanRepository } from '../../domain/ports/IPlanRepository.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { generatePlanSchema, listPlansQuerySchema } from '../schemas.js';
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

  app.get('/', zValidator('query', listPlansQuerySchema), async (c) => {
    const { niche } = c.req.valid('query');
    logger.debug('GET /api/plans', { niche: niche ?? 'all' });

    const plans = await planRepo.findAll(niche as Niche | undefined);
    logger.info('Plans listed', { count: plans.length, niche: niche ?? 'all' });

    return c.json({ data: plans });
  });

  return app;
}
