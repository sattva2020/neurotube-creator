import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createAuthMiddleware } from '../authMiddleware.js';
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

describe('authMiddleware', () => {
  let app: Hono<{ Variables: AuthVariables }>;
  let tokenService: ITokenService;
  let userRepo: IUserRepository;

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
    };

    app = new Hono<{ Variables: AuthVariables }>();
    app.use('*', createAuthMiddleware(tokenService, userRepo));
    app.get('/test', (c) => {
      const user = c.get('user');
      return c.json({ userId: user.userId, role: user.role, email: user.email });
    });
  });

  it('should pass with valid Bearer token and set user in context', async () => {
    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.userId).toBe('user-1');
    expect(body.role).toBe('editor');
    expect(body.email).toBe('test@example.com');
  });

  it('should return 401 when Authorization header is missing', async () => {
    const res = await app.request('/test');

    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.error).toBe('Unauthorized');
    expect(body.message).toContain('Authorization header');
  });

  it('should return 401 when Authorization header is not Bearer', async () => {
    const res = await app.request('/test', {
      headers: { Authorization: 'Basic credentials' },
    });

    expect(res.status).toBe(401);
  });

  it('should return 401 for invalid token', async () => {
    vi.mocked(tokenService.verifyAccessToken).mockResolvedValue(null);

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer invalid-token' },
    });

    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.message).toContain('expired');
  });

  it('should return 403 for deactivated user', async () => {
    vi.mocked(userRepo.findById).mockResolvedValue({ ...mockUser, isActive: false });

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(res.status).toBe(403);
    const body = await res.json() as any;
    expect(body.error).toBe('Forbidden');
  });

  it('should return 403 when user not found in DB', async () => {
    vi.mocked(userRepo.findById).mockResolvedValue(null);

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(res.status).toBe(403);
  });
});
