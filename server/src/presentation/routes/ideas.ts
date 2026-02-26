import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateIdeas } from '../../application/use-cases/GenerateIdeas.js';
import type { IIdeaRepository } from '../../domain/ports/IIdeaRepository.js';
import type { Niche } from '../../domain/entities/Niche.js';
import type { AuthVariables } from '../middleware/authMiddleware.js';
import { generateIdeasSchema, listIdeasQuerySchema, uuidParamSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('IdeasRoute');

export function ideasRoutes(generateIdeas: GenerateIdeas, ideaRepo: IIdeaRepository) {
  const app = new Hono<{ Variables: AuthVariables }>();

  app.post('/generate', zValidator('json', generateIdeasSchema), async (c) => {
    const { topic, niche } = c.req.valid('json');
    const { userId } = c.get('user');
    logger.debug('POST /api/ideas/generate', { topic, niche, userId });

    const ideas = await generateIdeas.execute(topic, niche, userId);
    logger.info('Ideas generated', { count: ideas.length, topic, niche, userId });

    return c.json({ data: ideas });
  });

  app.get('/:id', zValidator('param', uuidParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const { userId } = c.get('user');
    logger.debug('GET /api/ideas/:id', { id, userId });

    const idea = await ideaRepo.findById(id, userId);
    if (!idea) {
      logger.info('Idea not found', { id, userId });
      return c.json({ error: 'Idea not found' }, 404);
    }

    logger.info('Idea fetched', { id, title: idea.title });
    return c.json({ data: idea });
  });

  app.delete('/:id', zValidator('param', uuidParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const { userId } = c.get('user');
    logger.debug('DELETE /api/ideas/:id', { id, userId });

    await ideaRepo.delete(id, userId);
    logger.info('Idea deleted', { id, userId });

    return c.json({ success: true });
  });

  app.get('/', zValidator('query', listIdeasQuerySchema), async (c) => {
    const { niche } = c.req.valid('query');
    const { userId } = c.get('user');
    logger.debug('GET /api/ideas', { userId, niche: niche ?? 'all' });

    const ideas = await ideaRepo.findAll(userId, niche as Niche | undefined);
    logger.info('Ideas listed', { count: ideas.length, userId, niche: niche ?? 'all' });

    return c.json({ data: ideas });
  });

  return app;
}
