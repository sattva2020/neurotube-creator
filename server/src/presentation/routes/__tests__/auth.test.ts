import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { authRoutes } from '../auth.js';
import type { Register } from '../../../application/use-cases/Register.js';
import type { Login } from '../../../application/use-cases/Login.js';
import type { RefreshTokens } from '../../../application/use-cases/RefreshTokens.js';
import type { Logout } from '../../../application/use-cases/Logout.js';
import type { ITokenService } from '../../../domain/ports/ITokenService.js';
import type { IUserRepository } from '../../../domain/ports/IUserRepository.js';
import type { User } from '../../../domain/entities/User.js';
import { createGlobalAuthGuard } from '../../middleware/authMiddleware.js';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  passwordHash: 'hashed',
  role: 'viewer',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockResult = {
  user: mockUser,
  accessToken: 'access-token-xyz',
  refreshToken: 'refresh-token-123',
};

function createMocks() {
  return {
    register: { execute: vi.fn().mockResolvedValue(mockResult) } as unknown as Register,
    login: { execute: vi.fn().mockResolvedValue(mockResult) } as unknown as Login,
    refreshTokens: { execute: vi.fn().mockResolvedValue(mockResult) } as unknown as RefreshTokens,
    logout: { execute: vi.fn().mockResolvedValue(undefined) } as unknown as Logout,
    tokenService: {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
      verifyAccessToken: vi.fn().mockResolvedValue({ userId: 'user-1', role: 'viewer' }),
    } as unknown as ITokenService,
    userRepo: {
      findById: vi.fn().mockResolvedValue(mockUser),
      findByEmail: vi.fn(),
      save: vi.fn(),
      updateRole: vi.fn(),
      updatePassword: vi.fn(),
      deactivate: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    } as unknown as IUserRepository,
  };
}

function json(body: object) {
  return {
    method: 'POST' as const,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

describe('Auth Routes', () => {
  let app: Hono;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
    app = new Hono();
    // Apply global auth guard like app.ts does — protects /me, skips public paths
    app.use('/api/*', createGlobalAuthGuard(
      mocks.tokenService as unknown as ITokenService,
      mocks.userRepo as unknown as IUserRepository,
    ));
    app.route('/api/auth', authRoutes(mocks));
  });

  describe('POST /api/auth/register', () => {
    it('should register with valid input and return 201', async () => {
      const res = await app.request('/api/auth/register', json({
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
      }));

      expect(res.status).toBe(201);
      const body = await res.json() as any;
      expect(body.data.user.email).toBe('test@example.com');
      expect(body.data.tokens.accessToken).toBe('access-token-xyz');
      expect(body.data.user.passwordHash).toBeUndefined();
    });

    it('should return 400 for missing email', async () => {
      const res = await app.request('/api/auth/register', json({
        password: 'password123',
        displayName: 'User',
      }));

      expect(res.status).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const res = await app.request('/api/auth/register', json({
        email: 'test@example.com',
        password: 'short',
        displayName: 'User',
      }));

      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      vi.mocked(mocks.register as any).execute.mockRejectedValue(new Error('User already exists'));

      const res = await app.request('/api/auth/register', json({
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'User',
      }));

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials and return 200', async () => {
      const res = await app.request('/api/auth/login', json({
        email: 'test@example.com',
        password: 'password123',
      }));

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data.user.email).toBe('test@example.com');
      expect(body.data.tokens.accessToken).toBe('access-token-xyz');
    });

    it('should return 401 for invalid credentials', async () => {
      vi.mocked(mocks.login as any).execute.mockRejectedValue(new Error('Invalid credentials'));

      const res = await app.request('/api/auth/login', json({
        email: 'test@example.com',
        password: 'wrong',
      }));

      expect(res.status).toBe(401);
    });

    it('should return 403 for deactivated account', async () => {
      vi.mocked(mocks.login as any).execute.mockRejectedValue(new Error('Account deactivated'));

      const res = await app.request('/api/auth/login', json({
        email: 'test@example.com',
        password: 'password123',
      }));

      expect(res.status).toBe(403);
    });

    it('should return 400 for missing fields', async () => {
      const res = await app.request('/api/auth/login', json({
        email: 'test@example.com',
      }));

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens and return 200', async () => {
      const res = await app.request('/api/auth/refresh', json({
        refreshToken: 'refresh-token-123',
      }));

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data.tokens.accessToken).toBe('access-token-xyz');
    });

    it('should return 401 for invalid refresh token', async () => {
      vi.mocked(mocks.refreshTokens as any).execute.mockRejectedValue(new Error('Invalid refresh token'));

      const res = await app.request('/api/auth/refresh', json({
        refreshToken: 'bad-token',
      }));

      expect(res.status).toBe(401);
    });

    it('should return 400 for missing refreshToken', async () => {
      const res = await app.request('/api/auth/refresh', json({}));

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and return 200', async () => {
      const res = await app.request('/api/auth/logout', json({
        refreshToken: 'refresh-token-123',
      }));

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data.message).toBe('Logged out');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid auth', async () => {
      const res = await app.request('/api/auth/me', {
        headers: { Authorization: 'Bearer valid-token' },
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data.email).toBe('test@example.com');
      expect(body.data.passwordHash).toBeUndefined();
    });

    it('should return 401 without auth header', async () => {
      const res = await app.request('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      vi.mocked(mocks.tokenService.verifyAccessToken).mockResolvedValue(null);

      const res = await app.request('/api/auth/me', {
        headers: { Authorization: 'Bearer invalid-token' },
      });

      expect(res.status).toBe(401);
    });
  });
});
