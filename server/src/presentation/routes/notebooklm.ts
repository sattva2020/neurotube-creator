import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateNotebookLM } from '../../application/use-cases/GenerateNotebookLM.js';
import { generateNotebookLMSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('NotebookLMRoute');

export function notebooklmRoutes(generateNotebookLM: GenerateNotebookLM) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateNotebookLMSchema), async (c) => {
    const { videoTitle, planMarkdown, niche } = c.req.valid('json');
    logger.debug('POST /api/notebooklm/generate', { videoTitle, niche });

    const sourceDoc = await generateNotebookLM.execute(videoTitle, planMarkdown, niche);
    logger.info('NotebookLM source doc generated', { success: sourceDoc !== null, videoTitle, niche });

    return c.json({ data: sourceDoc });
  });

  return app;
}
