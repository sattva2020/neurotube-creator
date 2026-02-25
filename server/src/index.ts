import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './presentation/app.js';
import { createLogger } from './infrastructure/logger.js';

const logger = createLogger('Server');

const app = createApp();

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, () => {
  logger.info(`Server started on http://localhost:${port}`);
});
