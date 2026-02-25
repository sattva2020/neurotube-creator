import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateMonetization } from '../../application/use-cases/GenerateMonetization.js';
import { generateMonetizationSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('MonetizationRoute');

export function monetizationRoutes(generateMonetization: GenerateMonetization) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateMonetizationSchema), async (c) => {
    const { videoTitle, niche } = c.req.valid('json');
    logger.debug('POST /api/monetization/generate', { videoTitle, niche });

    const copy = await generateMonetization.execute(videoTitle, niche);
    logger.info('Monetization copy generated', { success: copy !== null, videoTitle, niche });

    return c.json({ data: copy });
  });

  return app;
}
