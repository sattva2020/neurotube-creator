import fs from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';
import { health } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { createAnalyticsMiddleware } from './middleware/analyticsMiddleware.js';
import { notFound } from './middleware/notFound.js';
import { createLogger } from '../infrastructure/logger.js';
import type { GenerateIdeas } from '../application/use-cases/GenerateIdeas.js';
import type { GeneratePlan } from '../application/use-cases/GeneratePlan.js';
import type { GenerateThumbnail } from '../application/use-cases/GenerateThumbnail.js';
import type { GenerateTitles } from '../application/use-cases/GenerateTitles.js';
import type { GenerateDescription } from '../application/use-cases/GenerateDescription.js';
import type { GenerateBranding } from '../application/use-cases/GenerateBranding.js';
import type { AnalyzeNiche } from '../application/use-cases/AnalyzeNiche.js';
import type { GenerateNotebookLM } from '../application/use-cases/GenerateNotebookLM.js';
import type { GenerateShorts } from '../application/use-cases/GenerateShorts.js';
import type { GenerateMonetization } from '../application/use-cases/GenerateMonetization.js';
import type { GenerateRoadmap } from '../application/use-cases/GenerateRoadmap.js';
import type { GenerateSunoPrompt } from '../application/use-cases/GenerateSunoPrompt.js';
import type { IIdeaRepository } from '../domain/ports/IIdeaRepository.js';
import type { IPlanRepository } from '../domain/ports/IPlanRepository.js';
import type { PostHogService } from '../infrastructure/analytics/index.js';
import { ideasRoutes } from './routes/ideas.js';
import { plansRoutes } from './routes/plans.js';
import { thumbnailsRoutes } from './routes/thumbnails.js';
import { titlesRoutes } from './routes/titles.js';
import { descriptionsRoutes } from './routes/descriptions.js';
import { brandingRoutes } from './routes/branding.js';
import { analysisRoutes } from './routes/analysis.js';
import { notebooklmRoutes } from './routes/notebooklm.js';
import { shortsRoutes } from './routes/shorts.js';
import { monetizationRoutes } from './routes/monetization.js';
import { roadmapRoutes } from './routes/roadmap.js';
import { sunoRoutes } from './routes/suno.js';

const logger = createLogger('App');

export interface AppDeps {
  generateIdeas: GenerateIdeas;
  generatePlan: GeneratePlan;
  generateThumbnail: GenerateThumbnail;
  generateTitles: GenerateTitles;
  generateDescription: GenerateDescription;
  generateBranding: GenerateBranding;
  analyzeNiche: AnalyzeNiche;
  generateNotebookLM: GenerateNotebookLM;
  generateShorts: GenerateShorts;
  generateMonetization: GenerateMonetization;
  generateRoadmap: GenerateRoadmap;
  generateSunoPrompt: GenerateSunoPrompt;
  ideaRepo: IIdeaRepository;
  planRepo: IPlanRepository;
  analytics: PostHogService;
}

export function createApp(deps: AppDeps) {
  logger.debug('Creating Hono app with DI dependencies');

  const app = new Hono();

  // --- Middleware ---
  app.use('*', requestLogger);
  app.use('/api/*', createAnalyticsMiddleware(deps.analytics));
  app.use('*', cors());

  // --- Routes ---
  app.route('/api/health', health);
  app.route('/api/ideas', ideasRoutes(deps.generateIdeas, deps.ideaRepo));
  app.route('/api/plans', plansRoutes(deps.generatePlan, deps.planRepo));
  app.route('/api/thumbnails', thumbnailsRoutes(deps.generateThumbnail));
  app.route('/api/titles', titlesRoutes(deps.generateTitles));
  app.route('/api/descriptions', descriptionsRoutes(deps.generateDescription));
  app.route('/api/branding', brandingRoutes(deps.generateBranding));
  app.route('/api/analysis', analysisRoutes(deps.analyzeNiche));
  app.route('/api/notebooklm', notebooklmRoutes(deps.generateNotebookLM));
  app.route('/api/shorts', shortsRoutes(deps.generateShorts));
  app.route('/api/monetization', monetizationRoutes(deps.generateMonetization));
  app.route('/api/roadmap', roadmapRoutes(deps.generateRoadmap));
  app.route('/api/suno', sunoRoutes(deps.generateSunoPrompt));

  // --- Static file serving (SPA) ---
  const staticDir = process.env.STATIC_DIR || path.join(__dirname, '../../client/dist');
  const staticDirResolved = path.resolve(staticDir);

  if (fs.existsSync(staticDirResolved)) {
    logger.info('Serving static files', { path: staticDirResolved });

    // Serve static assets from client build
    app.use('*', serveStatic({
      root: path.relative(process.cwd(), staticDirResolved),
    }));

    // SPA fallback: non-API routes → index.html
    app.use('*', serveStatic({
      root: path.relative(process.cwd(), staticDirResolved),
      rewriteRequestPath: () => '/index.html',
    }));
  } else {
    logger.warn('Static files directory not found, skipping SPA serving', { path: staticDirResolved });
  }

  // --- Error handling ---
  app.notFound(notFound);
  app.onError(errorHandler);

  logger.info('Hono app created', {
    routes: [
      '/api/health', '/api/ideas', '/api/plans', '/api/thumbnails',
      '/api/titles', '/api/descriptions', '/api/branding', '/api/analysis',
      '/api/notebooklm', '/api/shorts', '/api/monetization', '/api/roadmap', '/api/suno',
    ],
    staticDir: fs.existsSync(staticDirResolved) ? staticDirResolved : 'NOT FOUND',
  });

  return app;
}
