import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateIdeas } from '../../application/use-cases/GenerateIdeas.js';
import type { IIdeaRepository } from '../../domain/ports/IIdeaRepository.js';
import type { Niche } from '../../domain/entities/Niche.js';
import { generateIdeasSchema, listIdeasQuerySchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('IdeasRoute');

export function ideasRoutes(generateIdeas: GenerateIdeas, ideaRepo: IIdeaRepository) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateIdeasSchema), async (c) => {
    const { topic, niche } = c.req.valid('json');
    logger.debug('POST /api/ideas/generate', { topic, niche });

    const ideas = await generateIdeas.execute(topic, niche);
    logger.info('Ideas generated', { count: ideas.length, topic, niche });

    return c.json({ data: ideas });
  });

  app.get('/', zValidator('query', listIdeasQuerySchema), async (c) => {
    const { niche } = c.req.valid('query');
    logger.debug('GET /api/ideas', { niche: niche ?? 'all' });

    const ideas = await ideaRepo.findAll(niche as Niche | undefined);
    logger.info('Ideas listed', { count: ideas.length, niche: niche ?? 'all' });

    return c.json({ data: ideas });
  });

  return app;
}
