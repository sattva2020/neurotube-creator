import type { NotFoundHandler } from 'hono';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('NotFound');

export const notFound: NotFoundHandler = (c) => {
  const { method, path } = c.req;

  logger.warn('Route not found', { method, path });

  return c.json(
    {
      error: 'Not Found',
      message: `Route ${method} ${path} not found`,
      statusCode: 404,
    },
    404,
  );
};
