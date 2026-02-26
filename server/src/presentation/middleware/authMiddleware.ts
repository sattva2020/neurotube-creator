import type { MiddlewareHandler } from 'hono';
import type { ITokenService } from '../../domain/ports/ITokenService.js';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { Role } from '../../domain/entities/Role.js';
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
