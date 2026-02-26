import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { GetAllUsers } from '../../application/use-cases/GetAllUsers.js';
import type { UpdateUserRole } from '../../application/use-cases/UpdateUserRole.js';
import type { DeactivateUser } from '../../application/use-cases/DeactivateUser.js';
import type { LogActivity } from '../../application/use-cases/LogActivity.js';
import type { GetActivityLogs } from '../../application/use-cases/GetActivityLogs.js';
import type { GetAdminStats } from '../../application/use-cases/GetAdminStats.js';
import type { User } from '../../domain/entities/User.js';
import type { AuthVariables } from '../middleware/authMiddleware.js';
import { createRequireRole } from '../middleware/authMiddleware.js';
import { updateUserRoleSchema, uuidParamSchema, activityLogsQuerySchema } from '../schemas.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('AdminRoutes');

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

export interface AdminRoutesDeps {
  getAllUsers: GetAllUsers;
  updateUserRole: UpdateUserRole;
  deactivateUser: DeactivateUser;
  logActivity: LogActivity;
  getActivityLogs: GetActivityLogs;
  getAdminStats: GetAdminStats;
}

export function adminRoutes(deps: AdminRoutesDeps) {
  const app = new Hono<{ Variables: AuthVariables }>();
  const { getAllUsers, updateUserRole, deactivateUser, logActivity, getActivityLogs, getAdminStats } = deps;
  const requireAdmin = createRequireRole('admin');

  // All admin routes require at least admin role
  app.use('*', requireAdmin);

  // GET /api/admin/users — list all users
  app.get('/users', async (c) => {
    logger.debug('GET /api/admin/users');

    const users = await getAllUsers.execute();

    logger.info('Users listed', { count: users.length });
    return c.json({
      data: {
        users: users.map(toPublicUser),
        total: users.length,
      },
    });
  });

  // PATCH /api/admin/users/:id/role — update user role
  app.patch('/users/:id/role', zValidator('json', updateUserRoleSchema), async (c) => {
    const { id } = c.req.param();
    const { role } = c.req.valid('json');
    const actor = c.get('user');
    logger.debug('PATCH /api/admin/users/:id/role', { targetId: id, newRole: role, actorId: actor.userId });

    // Validate UUID format
    const parsed = uuidParamSchema.safeParse({ id });
    if (!parsed.success) {
      return c.json({ error: 'Bad Request', message: 'Invalid user ID format', statusCode: 400 }, 400);
    }

    try {
      const updated = await updateUserRole.execute({
        targetUserId: id,
        newRole: role,
        actorId: actor.userId,
        actorRole: actor.role,
      });

      logActivity.execute({
        userId: actor.userId,
        action: 'user.role_updated',
        resourceType: 'user',
        resourceId: id,
        metadata: { newRole: role, previousRole: undefined },
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      }).catch((err) => logger.error('Failed to log activity', { error: String(err) }));

      logger.info('User role updated', { targetId: id, newRole: role, actorId: actor.userId });
      return c.json({ data: toPublicUser(updated) });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update role';
      if (message === 'User not found') {
        return c.json({ error: 'Not Found', message, statusCode: 404 }, 404);
      }
      if (
        message === 'Cannot change owner role' ||
        message === 'Cannot assign role equal to or higher than own' ||
        message === 'Cannot modify user with equal or higher role' ||
        message === 'Cannot change own role'
      ) {
        return c.json({ error: 'Forbidden', message, statusCode: 403 }, 403);
      }
      throw err;
    }
  });

  // POST /api/admin/users/:id/deactivate — deactivate user
  app.post('/users/:id/deactivate', async (c) => {
    const { id } = c.req.param();
    const actor = c.get('user');
    logger.debug('POST /api/admin/users/:id/deactivate', { targetId: id, actorId: actor.userId });

    const parsed = uuidParamSchema.safeParse({ id });
    if (!parsed.success) {
      return c.json({ error: 'Bad Request', message: 'Invalid user ID format', statusCode: 400 }, 400);
    }

    try {
      const deactivated = await deactivateUser.execute({
        targetUserId: id,
        actorId: actor.userId,
        actorRole: actor.role,
      });

      logActivity.execute({
        userId: actor.userId,
        action: 'user.deactivated',
        resourceType: 'user',
        resourceId: id,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      }).catch((err) => logger.error('Failed to log activity', { error: String(err) }));

      logger.info('User deactivated', { targetId: id, actorId: actor.userId });
      return c.json({ data: toPublicUser(deactivated) });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate user';
      if (message === 'User not found') {
        return c.json({ error: 'Not Found', message, statusCode: 404 }, 404);
      }
      if (
        message === 'Cannot deactivate owner' ||
        message === 'Cannot deactivate user with equal or higher role' ||
        message === 'Cannot deactivate own account'
      ) {
        return c.json({ error: 'Forbidden', message, statusCode: 403 }, 403);
      }
      throw err;
    }
  });

  // GET /api/admin/stats — dashboard statistics
  app.get('/stats', async (c) => {
    logger.debug('GET /api/admin/stats');

    const stats = await getAdminStats.execute();

    logger.info('Admin stats fetched', { totalUsers: stats.totalUsers });
    return c.json({ data: { stats } });
  });

  // GET /api/admin/activity-logs — paginated activity logs
  app.get('/activity-logs', zValidator('query', activityLogsQuerySchema), async (c) => {
    const { limit, offset, userId, action } = c.req.valid('query');
    logger.debug('GET /api/admin/activity-logs', { limit, offset, userId, action });

    const result = await getActivityLogs.execute({
      filters: { userId, action },
      limit,
      offset,
    });

    logger.info('Activity logs fetched', { count: result.logs.length, total: result.total });
    return c.json({
      data: {
        logs: result.logs.map((log) => ({
          ...log,
          createdAt: log.createdAt?.toISOString(),
        })),
        total: result.total,
      },
    });
  });

  return app;
}
