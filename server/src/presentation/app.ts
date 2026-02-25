import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { health } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createLogger } from '../infrastructure/logger.js';

const logger = createLogger('App');

export function createApp() {
  const app = new Hono();

  app.use('*', cors());

  app.route('/api/health', health);

  app.onError(errorHandler);

  logger.info('Hono app created', { routes: ['/api/health'] });

  return app;
}
