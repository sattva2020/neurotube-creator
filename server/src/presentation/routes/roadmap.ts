import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GenerateRoadmap } from '../../application/use-cases/GenerateRoadmap.js';
import { generateRoadmapSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('RoadmapRoute');

export function roadmapRoutes(generateRoadmap: GenerateRoadmap) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateRoadmapSchema), async (c) => {
    const { videoTitle, niche } = c.req.valid('json');
    logger.debug('POST /api/roadmap/generate', { videoTitle, niche });

    const roadmap = await generateRoadmap.execute(videoTitle, niche);
    logger.info('Roadmap generated', { success: roadmap !== null, videoTitle, niche });

    return c.json({ data: roadmap });
  });

  return app;
}
