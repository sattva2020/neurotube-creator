import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Register } from '../../application/use-cases/Register.js';
import type { Login } from '../../application/use-cases/Login.js';
import type { RefreshTokens } from '../../application/use-cases/RefreshTokens.js';
import type { Logout } from '../../application/use-cases/Logout.js';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { LogActivity } from '../../application/use-cases/LogActivity.js';
import type { User } from '../../domain/entities/User.js';
import type { AuthVariables } from '../middleware/authMiddleware.js';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('AuthRoutes');

/** Strip passwordHash from User for API responses */
function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt?.toISOString(),
  };
}

/** Extract client meta from request headers */
function extractMeta(c: { req: { header: (name: string) => string | undefined } }) {
  return {
    userAgent: c.req.header('user-agent'),
    ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
  };
}

export interface AuthRoutesDeps {
  register: Register;
  login: Login;
  refreshTokens: RefreshTokens;
  logout: Logout;
  userRepo: IUserRepository;
  logActivity: LogActivity;
}

export function authRoutes(deps: AuthRoutesDeps) {
  const app = new Hono<{ Variables: AuthVariables }>();
  const { register, login, refreshTokens, logout, userRepo, logActivity } = deps;

  app.post('/register', zValidator('json', registerSchema), async (c) => {
    const body = c.req.valid('json');
    logger.debug('POST /api/auth/register', { email: body.email });

    try {
      const result = await register.execute(body, extractMeta(c));
      logger.info('User registered', { userId: result.user.id });

      logActivity.execute({
        userId: result.user.id!,
        action: 'user.registered',
        resourceType: 'user',
        resourceId: result.user.id,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      }).catch((err) => logger.error('Failed to log activity', { error: String(err) }));

      return c.json({
        data: {
          user: toPublicUser(result.user),
          tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken },
        },
      }, 201);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      if (message === 'User already exists') {
        return c.json({ error: 'Conflict', message, statusCode: 409 }, 409);
      }
      throw err;
    }
  });

  app.post('/login', zValidator('json', loginSchema), async (c) => {
    const body = c.req.valid('json');
    logger.debug('POST /api/auth/login', { email: body.email });

    try {
      const result = await login.execute(body, extractMeta(c));
      logger.info('User logged in', { userId: result.user.id });

      logActivity.execute({
        userId: result.user.id!,
        action: 'user.login',
        resourceType: 'user',
        resourceId: result.user.id,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      }).catch((err) => logger.error('Failed to log activity', { error: String(err) }));

      return c.json({
        data: {
          user: toPublicUser(result.user),
          tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken },
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message === 'Invalid credentials') {
        return c.json({ error: 'Unauthorized', message, statusCode: 401 }, 401);
      }
      if (message === 'Account deactivated') {
        return c.json({ error: 'Forbidden', message, statusCode: 403 }, 403);
      }
      throw err;
    }
  });

  app.post('/refresh', zValidator('json', refreshSchema), async (c) => {
    const body = c.req.valid('json');
    logger.debug('POST /api/auth/refresh');

    try {
      const result = await refreshTokens.execute(body, extractMeta(c));
      logger.info('Tokens refreshed', { userId: result.user.id });

      return c.json({
        data: {
          user: toPublicUser(result.user),
          tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken },
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Refresh failed';
      if (message === 'Invalid refresh token') {
        return c.json({ error: 'Unauthorized', message, statusCode: 401 }, 401);
      }
      if (message === 'Account deactivated') {
        return c.json({ error: 'Forbidden', message, statusCode: 403 }, 403);
      }
      throw err;
    }
  });

  app.post('/logout', zValidator('json', logoutSchema), async (c) => {
    const body = c.req.valid('json');
    logger.debug('POST /api/auth/logout');

    await logout.execute(body);
    logger.info('User logged out');

    return c.json({ data: { message: 'Logged out' } });
  });

  // Auth is enforced by global auth guard — /api/auth/me is not in PUBLIC_PATHS
  app.get('/me', async (c) => {
    logger.debug('GET /api/auth/me');

    const authUser = c.get('user');
    const user = await userRepo.findById(authUser.userId);

    if (!user) {
      return c.json({ error: 'Not Found', message: 'User not found', statusCode: 404 }, 404);
    }

    return c.json({ data: toPublicUser(user) });
  });

  return app;
}
