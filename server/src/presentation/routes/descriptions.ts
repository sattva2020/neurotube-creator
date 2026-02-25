import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateDescription } from '../../application/use-cases/GenerateDescription.js';
import { generateDescriptionSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('DescriptionsRoute');

export function descriptionsRoutes(generateDescription: GenerateDescription) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateDescriptionSchema), async (c) => {
    const { videoTitle, planMarkdown, niche } = c.req.valid('json');
    logger.debug('POST /api/descriptions/generate', { videoTitle, niche });

    const description = await generateDescription.execute(videoTitle, planMarkdown, niche);
    logger.info('Description generated', { success: description !== null, videoTitle, niche });

    return c.json({ data: description });
  });

  return app;
}
