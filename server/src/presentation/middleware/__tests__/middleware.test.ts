import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { ZodError } from 'zod';
import { errorHandler } from '../errorHandler.js';
import { notFound } from '../notFound.js';
import { requestLogger } from '../requestLogger.js';

describe('errorHandler', () => {
  it('should return 500 with structured error for generic errors', async () => {
    const app = new Hono();
    app.get('/error', () => {
      throw new Error('Something broke');
    });
    app.onError(errorHandler);

    const res = await app.request('/error');

    expect(res.status).toBe(500);
    const body = await res.json() as { error: string; message: string; statusCode: number };
    expect(body.error).toBe('Internal Server Error');
    expect(body.message).toBe('Something broke');
    expect(body.statusCode).toBe(500);
  });

  it('should return 400 with validation details for ZodError', async () => {
    const app = new Hono();
    app.get('/zod-error', () => {
      throw new ZodError([
        { code: 'custom', message: 'Invalid field', path: ['topic'], fatal: false },
      ]);
    });
    app.onError(errorHandler);

    const res = await app.request('/zod-error');

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string; message: string; statusCode: number };
    expect(body.error).toBe('Validation Error');
    expect(body.message).toContain('topic');
    expect(body.statusCode).toBe(400);
  });
});

describe('notFound', () => {
  it('should return 404 with structured error for unknown routes', async () => {
    const app = new Hono();
    app.notFound(notFound);

    const res = await app.request('/unknown/path');

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string; message: string; statusCode: number };
    expect(body.error).toBe('Not Found');
    expect(body.message).toContain('/unknown/path');
    expect(body.statusCode).toBe(404);
  });

  it('should include HTTP method in message', async () => {
    const app = new Hono();
    app.notFound(notFound);

    const res = await app.request('/missing', { method: 'POST' });

    const body = await res.json() as { message: string };
    expect(body.message).toContain('POST');
  });
});

describe('requestLogger', () => {
  it('should not interfere with request/response flow', async () => {
    const app = new Hono();
    app.use('*', requestLogger);
    app.get('/test', (c) => c.json({ ok: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it('should pass through POST requests', async () => {
    const app = new Hono();
    app.use('*', requestLogger);
    app.post('/test', async (c) => {
      const data = await c.req.json();
      return c.json({ data });
    });

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'test' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: { topic: string } };
    expect(body.data.topic).toBe('test');
  });
});
