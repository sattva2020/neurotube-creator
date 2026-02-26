import { z } from 'zod';
import { createLogger } from '../logger.js';

const logger = createLogger('Config');

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  STATIC_DIR: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  logger.info('Validating environment variables');

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    logger.error('Environment validation failed', errors);
    throw new Error(`Invalid environment: ${JSON.stringify(errors)}`);
  }

  logger.debug('Environment validated', {
    PORT: result.data.PORT,
    LOG_LEVEL: result.data.LOG_LEVEL,
    NODE_ENV: result.data.NODE_ENV,
    STATIC_DIR: result.data.STATIC_DIR || '(auto)',
    DATABASE_URL: '***',
    GEMINI_API_KEY: '***',
  });

  return result.data;
}

export const env = loadEnv();
