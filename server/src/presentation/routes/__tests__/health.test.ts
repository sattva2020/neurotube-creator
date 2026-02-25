import { describe, it, expect } from 'vitest';
import { createApp } from '../../app.js';

describe('GET /api/health', () => {
  const app = createApp();

  it('should return 200 with status ok', async () => {
    const res = await app.request('/api/health');

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(typeof body.uptime).toBe('number');
  });

  it('should return JSON content-type', async () => {
    const res = await app.request('/api/health');

    expect(res.headers.get('content-type')).toContain('application/json');
  });
});
