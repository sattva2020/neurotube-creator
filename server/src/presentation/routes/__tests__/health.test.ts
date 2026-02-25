import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { health } from '../health.js';

describe('GET /api/health', () => {
  const app = new Hono();
  app.route('/api/health', health);

  it('should return 200 with status ok', async () => {
    const res = await app.request('/api/health');

    expect(res.status).toBe(200);

    const body = await res.json() as Record<string, unknown>;
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(typeof body.uptime).toBe('number');
  });

  it('should return JSON content-type', async () => {
    const res = await app.request('/api/health');

    expect(res.headers.get('content-type')).toContain('application/json');
  });
});
