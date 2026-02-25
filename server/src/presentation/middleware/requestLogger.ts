import type { MiddlewareHandler } from 'hono';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('HTTP');

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const { method, path } = c.req;

  logger.debug('Request received', { method, path });

  await next();

  const elapsed = Date.now() - start;
  const status = c.res.status;

  logger.info('Request completed', { method, path, status, elapsed });
};
