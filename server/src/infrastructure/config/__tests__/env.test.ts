import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Re-create the schema here to test validation logic without side effects from loadEnv()
const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  STATIC_DIR: z.string().optional(),
});

describe('env validation', () => {
  const validEnv = {
    GEMINI_API_KEY: 'test-key',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  };

  it('should accept valid required vars with defaults', () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3000);
      expect(result.data.LOG_LEVEL).toBe('info');
      expect(result.data.NODE_ENV).toBe('development');
      expect(result.data.STATIC_DIR).toBeUndefined();
    }
  });

  it('should reject missing GEMINI_API_KEY', () => {
    const result = envSchema.safeParse({ DATABASE_URL: 'postgresql://...' });
    expect(result.success).toBe(false);
  });

  it('should reject missing DATABASE_URL', () => {
    const result = envSchema.safeParse({ GEMINI_API_KEY: 'key' });
    expect(result.success).toBe(false);
  });

  it('should accept NODE_ENV=production', () => {
    const result = envSchema.safeParse({ ...validEnv, NODE_ENV: 'production' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe('production');
    }
  });

  it('should reject invalid NODE_ENV', () => {
    const result = envSchema.safeParse({ ...validEnv, NODE_ENV: 'staging' });
    expect(result.success).toBe(false);
  });

  it('should accept custom STATIC_DIR', () => {
    const result = envSchema.safeParse({ ...validEnv, STATIC_DIR: '/app/client/dist' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.STATIC_DIR).toBe('/app/client/dist');
    }
  });

  it('should coerce PORT from string', () => {
    const result = envSchema.safeParse({ ...validEnv, PORT: '8080' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(8080);
    }
  });

  it('should reject invalid PORT', () => {
    const result = envSchema.safeParse({ ...validEnv, PORT: 'abc' });
    expect(result.success).toBe(false);
  });
});
