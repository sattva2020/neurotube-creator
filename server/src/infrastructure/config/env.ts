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
  POSTHOG_API_KEY: z.string().optional().default(''),
  POSTHOG_HOST: z.string().optional().default('https://us.i.posthog.com'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
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
    POSTHOG_API_KEY: result.data.POSTHOG_API_KEY ? '***' : '(disabled)',
    POSTHOG_HOST: result.data.POSTHOG_HOST,
    JWT_SECRET: '***',
    JWT_ACCESS_EXPIRES_IN: result.data.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: result.data.JWT_REFRESH_EXPIRES_IN,
  });

  return result.data;
}

export const env = loadEnv();
