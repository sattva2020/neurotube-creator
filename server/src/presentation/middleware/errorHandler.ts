import type { Context } from 'hono';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('ErrorHandler');

export function errorHandler(err: Error, c: Context) {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
      statusCode: 500,
    },
    500,
  );
}
