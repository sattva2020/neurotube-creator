import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateSunoPrompt } from '../../application/use-cases/GenerateSunoPrompt.js';
import { generateSunoSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('SunoRoute');

export function sunoRoutes(generateSunoPrompt: GenerateSunoPrompt) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateSunoSchema), async (c) => {
    const { videoTitle, planMarkdown } = c.req.valid('json');
    logger.debug('POST /api/suno/generate', { videoTitle });

    const sunoPrompt = await generateSunoPrompt.execute(videoTitle, planMarkdown);
    logger.info('Suno prompt generated', { success: sunoPrompt !== null, videoTitle });

    return c.json({ data: sunoPrompt });
  });

  return app;
}
