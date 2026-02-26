import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createGlobalAuthGuard } from '../authMiddleware.js';
import type { ITokenService } from '../../../domain/ports/ITokenService.js';
import type { IUserRepository } from '../../../domain/ports/IUserRepository.js';
import type { User } from '../../../domain/entities/User.js';
import type { AuthVariables } from '../authMiddleware.js';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  passwordHash: 'hashed',
  role: 'editor',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('createGlobalAuthGuard', () => {
  let tokenService: ITokenService;
  let userRepo: IUserRepository;
  let app: Hono<{ Variables: AuthVariables }>;

  beforeEach(() => {
    tokenService = {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
      verifyAccessToken: vi.fn().mockResolvedValue({ userId: 'user-1', role: 'editor' }),
    };

    userRepo = {
      findById: vi.fn().mockResolvedValue(mockUser),
      findByEmail: vi.fn(),
      save: vi.fn(),
      updateRole: vi.fn(),
      updatePassword: vi.fn(),
      deactivate: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    };

    app = new Hono<{ Variables: AuthVariables }>();
    app.use('/api/*', createGlobalAuthGuard(tokenService, userRepo));

    // Public routes
    app.post('/api/auth/register', (c) => c.json({ ok: 'register' }));
    app.post('/api/auth/login', (c) => c.json({ ok: 'login' }));
    app.post('/api/auth/refresh', (c) => c.json({ ok: 'refresh' }));
    app.post('/api/auth/logout', (c) => c.json({ ok: 'logout' }));
    app.get('/api/health', (c) => c.json({ ok: 'health' }));

    // Protected routes
    app.get('/api/auth/me', (c) => c.json({ ok: 'me' }));
    app.get('/api/ideas', (c) => c.json({ ok: 'ideas' }));
    app.get('/api/admin/users', (c) => c.json({ ok: 'admin' }));
  });

  describe('public paths skip auth', () => {
    it('should skip auth for /api/auth/register', async () => {
      const res = await app.request('/api/auth/register', { method: 'POST' });
      expect(res.status).toBe(200);
      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should skip auth for /api/auth/login', async () => {
      const res = await app.request('/api/auth/login', { method: 'POST' });
      expect(res.status).toBe(200);
      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should skip auth for /api/auth/refresh', async () => {
      const res = await app.request('/api/auth/refresh', { method: 'POST' });
      expect(res.status).toBe(200);
      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should skip auth for /api/auth/logout', async () => {
      const res = await app.request('/api/auth/logout', { method: 'POST' });
      expect(res.status).toBe(200);
      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should skip auth for /api/health', async () => {
      const res = await app.request('/api/health');
      expect(res.status).toBe(200);
      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('protected paths enforce auth', () => {
    it('should return 401 for /api/auth/me without token', async () => {
      const res = await app.request('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 for /api/ideas without token', async () => {
      const res = await app.request('/api/ideas');
      expect(res.status).toBe(401);
    });

    it('should return 401 for /api/admin/users without token', async () => {
      const res = await app.request('/api/admin/users');
      expect(res.status).toBe(401);
    });

    it('should allow /api/auth/me with valid token', async () => {
      const res = await app.request('/api/auth/me', {
        headers: { Authorization: 'Bearer valid-token' },
      });
      expect(res.status).toBe(200);
    });

    it('should allow /api/ideas with valid token', async () => {
      const res = await app.request('/api/ideas', {
        headers: { Authorization: 'Bearer valid-token' },
      });
      expect(res.status).toBe(200);
    });
  });
});
