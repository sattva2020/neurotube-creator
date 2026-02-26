import type { MiddlewareHandler } from 'hono';
import type { ITokenService } from '../../domain/ports/ITokenService.js';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import { type Role, ROLE_HIERARCHY } from '../../domain/entities/Role.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('AuthMiddleware');

/** Shape of the user context set by authMiddleware */
export interface AuthUser {
  userId: string;
  role: Role;
  email: string;
}

/** Hono Variables type — use with `Hono<{ Variables: AuthVariables }>` */
export interface AuthVariables {
  user: AuthUser;
}

export function createAuthMiddleware(
  tokenService: ITokenService,
  userRepo: IUserRepository,
): MiddlewareHandler {
  logger.debug('Auth middleware created');

  return async (c, next) => {
    const start = Date.now();
    const authHeader = c.req.header('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      logger.debug('Missing or invalid Authorization header');
      return c.json(
        { error: 'Unauthorized', message: 'Missing or invalid Authorization header', statusCode: 401 },
        401,
      );
    }

    const token = authHeader.slice(7);
    const payload = await tokenService.verifyAccessToken(token);

    if (!payload) {
      logger.debug('Invalid or expired access token');
      return c.json(
        { error: 'Unauthorized', message: 'Invalid or expired access token', statusCode: 401 },
        401,
      );
    }

    const user = await userRepo.findById(payload.userId);

    if (!user || !user.isActive) {
      logger.info('Account not found or deactivated', { userId: payload.userId });
      return c.json(
        { error: 'Forbidden', message: 'Account not found or deactivated', statusCode: 403 },
        403,
      );
    }

    c.set('user', { userId: user.id!, role: user.role, email: user.email });

    const elapsed = Date.now() - start;
    logger.debug('Auth passed', { userId: user.id, role: user.role, elapsed });

    await next();
  };
}

/** Public API paths that skip authentication */
const PUBLIC_PATHS = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/health',
];

/**
 * Global auth guard for /api/* — skips PUBLIC_PATHS, enforces auth on everything else.
 * Apply once in app.ts: `app.use('/api/*', createGlobalAuthGuard(tokenService, userRepo))`
 */
export function createGlobalAuthGuard(
  tokenService: ITokenService,
  userRepo: IUserRepository,
): MiddlewareHandler {
  const authMw = createAuthMiddleware(tokenService, userRepo);
  logger.debug('Global auth guard created', { publicPaths: PUBLIC_PATHS });

  return async (c, next) => {
    const requestPath = c.req.path;

    if (PUBLIC_PATHS.some((p) => requestPath === p || requestPath === `${p}/`)) {
      logger.debug('Public path — skipping auth', { path: requestPath });
      return next();
    }

    logger.debug('Protected path — enforcing auth', { path: requestPath });
    return authMw(c, next);
  };
}

/**
 * Authorization middleware factory — checks that the authenticated user
 * has at least `minRole` level in the ROLE_HIERARCHY.
 *
 * Must be applied AFTER authMiddleware (expects `c.get('user')` to be set).
 */
export function createRequireRole(minRole: Role): MiddlewareHandler {
  logger.debug('RequireRole middleware created', { minRole });

  return async (c, next) => {
    const authUser = c.get('user') as AuthUser | undefined;

    if (!authUser) {
      logger.warn('requireRole called without authenticated user');
      return c.json(
        { error: 'Unauthorized', message: 'Authentication required', statusCode: 401 },
        401,
      );
    }

    const userLevel = ROLE_HIERARCHY[authUser.role];
    const requiredLevel = ROLE_HIERARCHY[minRole];

    if (userLevel < requiredLevel) {
      logger.info('Access denied — insufficient role', {
        userId: authUser.userId,
        userRole: authUser.role,
        requiredRole: minRole,
        userLevel,
        requiredLevel,
      });
      return c.json(
        { error: 'Forbidden', message: 'Insufficient permissions', statusCode: 403 },
        403,
      );
    }

    logger.debug('Role check passed', {
      userId: authUser.userId,
      role: authUser.role,
      minRole,
    });

    await next();
  };
}
