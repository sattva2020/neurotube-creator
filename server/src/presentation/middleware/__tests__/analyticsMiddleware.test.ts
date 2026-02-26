import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createAnalyticsMiddleware } from '../analyticsMiddleware.js';
import type { PostHogService } from '../../../infrastructure/analytics/index.js';

function createMockAnalytics(): PostHogService {
  return {
    trackEvent: vi.fn(),
    trackApiCall: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  } as unknown as PostHogService;
}

describe('analyticsMiddleware', () => {
  let analytics: PostHogService;

  beforeEach(() => {
    analytics = createMockAnalytics();
  });

  it('tracks API calls with method, path, status, elapsed', async () => {
    const app = new Hono();
    app.use('/api/*', createAnalyticsMiddleware(analytics));
    app.get('/api/ideas', (c) => c.json({ data: [] }));

    await app.request('/api/ideas');

    expect(analytics.trackApiCall).toHaveBeenCalledOnce();
    const call = (analytics.trackApiCall as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.method).toBe('GET');
    expect(call.path).toBe('/api/ideas');
    expect(call.status).toBe(200);
    expect(call.routeGroup).toBe('ideas');
    expect(typeof call.elapsed).toBe('number');
  });

  it('skips /api/health', async () => {
    const app = new Hono();
    app.use('/api/*', createAnalyticsMiddleware(analytics));
    app.get('/api/health', (c) => c.json({ status: 'ok' }));

    await app.request('/api/health');

    expect(analytics.trackApiCall).not.toHaveBeenCalled();
  });

  it('extracts niche from POST body', async () => {
    const app = new Hono();
    app.use('/api/*', createAnalyticsMiddleware(analytics));
    app.post('/api/ideas/generate', async (c) => {
      const body = await c.req.json();
      return c.json({ data: body });
    });

    await app.request('/api/ideas/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'test', niche: 'psychology' }),
    });

    const call = (analytics.trackApiCall as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.niche).toBe('psychology');
  });

  it('does not interfere with request/response flow', async () => {
    const app = new Hono();
    app.use('/api/*', createAnalyticsMiddleware(analytics));
    app.get('/api/test', (c) => c.json({ ok: true }));

    const res = await app.request('/api/test');

    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it('tracks non-200 status codes', async () => {
    const app = new Hono();
    app.use('/api/*', createAnalyticsMiddleware(analytics));
    app.get('/api/fail', (c) => c.json({ error: 'Not Found' }, 404));

    await app.request('/api/fail');

    const call = (analytics.trackApiCall as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.status).toBe(404);
  });
});
