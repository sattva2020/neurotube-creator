import type { Context } from 'hono';
import { ZodError } from 'zod';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('ErrorHandler');

export function errorHandler(err: Error, c: Context) {
  if (err instanceof ZodError) {
    logger.warn('Validation error', {
      path: c.req.path,
      method: c.req.method,
      issues: err.issues,
    });

    return c.json(
      {
        error: 'Validation Error',
        message: err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        statusCode: 400,
      },
      400,
    );
  }

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
