import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AnalyzeNiche } from '../../application/use-cases/AnalyzeNiche.js';
import { analyzeNicheSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('AnalysisRoute');

export function analysisRoutes(analyzeNiche: AnalyzeNiche) {
  const app = new Hono();

  app.post('/niche', zValidator('json', analyzeNicheSchema), async (c) => {
    const { videoTitle, niche } = c.req.valid('json');
    logger.debug('POST /api/analysis/niche', { videoTitle, niche });

    const analysis = await analyzeNiche.execute(videoTitle, niche);
    logger.info('Niche analysis completed', { success: analysis !== null, videoTitle, niche });

    return c.json({ data: analysis });
  });

  return app;
}
