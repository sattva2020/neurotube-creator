import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateTitles } from '../../application/use-cases/GenerateTitles.js';
import { generateTitlesSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('TitlesRoute');

export function titlesRoutes(generateTitles: GenerateTitles) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateTitlesSchema), async (c) => {
    const { titleIdea } = c.req.valid('json');
    logger.debug('POST /api/titles/generate', { titleIdea });

    const titles = await generateTitles.execute(titleIdea);
    logger.info('Titles generated', { count: titles.length, titleIdea });

    return c.json({ data: titles });
  });

  return app;
}
