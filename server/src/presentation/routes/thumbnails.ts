import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateThumbnail } from '../../application/use-cases/GenerateThumbnail.js';
import { generateThumbnailSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('ThumbnailsRoute');

export function thumbnailsRoutes(generateThumbnail: GenerateThumbnail) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateThumbnailSchema), async (c) => {
    const { prompt } = c.req.valid('json');
    logger.debug('POST /api/thumbnails/generate', { promptLength: prompt.length });

    const imageBase64 = await generateThumbnail.execute(prompt);
    logger.info('Thumbnail generated', { success: imageBase64 !== null });

    return c.json({ data: imageBase64 });
  });

  return app;
}
