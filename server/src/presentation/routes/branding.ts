import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateBranding } from '../../application/use-cases/GenerateBranding.js';
import { generateBrandingSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('BrandingRoute');

export function brandingRoutes(generateBranding: GenerateBranding) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateBrandingSchema), async (c) => {
    const { videoTitle, niche } = c.req.valid('json');
    logger.debug('POST /api/branding/generate', { videoTitle, niche });

    const branding = await generateBranding.execute(videoTitle, niche);
    logger.info('Branding generated', { success: branding !== null, videoTitle, niche });

    return c.json({ data: branding });
  });

  return app;
}
