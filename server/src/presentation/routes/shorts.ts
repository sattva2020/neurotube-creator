import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateShorts } from '../../application/use-cases/GenerateShorts.js';
import { generateShortsSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('ShortsRoute');

export function shortsRoutes(generateShorts: GenerateShorts) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateShortsSchema), async (c) => {
    const { videoTitle, planMarkdown } = c.req.valid('json');
    logger.debug('POST /api/shorts/generate', { videoTitle });

    const shorts = await generateShorts.execute(videoTitle, planMarkdown);
    logger.info('Shorts ideas generated', { success: shorts !== null, videoTitle });

    return c.json({ data: shorts });
  });

  return app;
}
