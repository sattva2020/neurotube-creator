import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createRequireRole } from '../authMiddleware.js';
import type { AuthVariables, AuthUser } from '../authMiddleware.js';

function createApp(minRole: Parameters<typeof createRequireRole>[0], userOverrides?: Partial<AuthUser>) {
  const app = new Hono<{ Variables: AuthVariables }>();

  // Simulate auth middleware setting user context
  app.use('*', async (c, next) => {
    const user: AuthUser = {
      userId: 'user-1',
      role: 'viewer',
      email: 'test@example.com',
      ...userOverrides,
    };
    c.set('user', user);
    await next();
  });

  app.use('*', createRequireRole(minRole));
  app.get('/test', (c) => c.json({ ok: true }));

  return app;
}

describe('createRequireRole', () => {
  it('should allow owner to access viewer-required route', async () => {
    const app = createApp('viewer', { role: 'owner' });
    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });

  it('should allow admin to access admin-required route', async () => {
    const app = createApp('admin', { role: 'admin' });
    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });

  it('should allow owner to access admin-required route', async () => {
    const app = createApp('admin', { role: 'owner' });
    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });

  it('should deny viewer access to editor-required route', async () => {
    const app = createApp('editor', { role: 'viewer' });
    const res = await app.request('/test');
    expect(res.status).toBe(403);
    const body = await res.json() as any;
    expect(body.error).toBe('Forbidden');
    expect(body.message).toBe('Insufficient permissions');
  });

  it('should deny viewer access to admin-required route', async () => {
    const app = createApp('admin', { role: 'viewer' });
    const res = await app.request('/test');
    expect(res.status).toBe(403);
  });

  it('should deny editor access to admin-required route', async () => {
    const app = createApp('admin', { role: 'editor' });
    const res = await app.request('/test');
    expect(res.status).toBe(403);
  });

  it('should allow editor to access editor-required route (equal role)', async () => {
    const app = createApp('editor', { role: 'editor' });
    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });

  it('should return 401 when no user in context', async () => {
    const app = new Hono<{ Variables: AuthVariables }>();
    // Skip setting user context
    app.use('*', createRequireRole('viewer'));
    app.get('/test', (c) => c.json({ ok: true }));

    const res = await app.request('/test');
    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.error).toBe('Unauthorized');
  });
});
