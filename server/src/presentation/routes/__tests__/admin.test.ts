import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { adminRoutes } from '../admin.js';
import type { GetAllUsers } from '../../../application/use-cases/GetAllUsers.js';
import type { UpdateUserRole } from '../../../application/use-cases/UpdateUserRole.js';
import type { DeactivateUser } from '../../../application/use-cases/DeactivateUser.js';
import { LogActivity } from '../../../application/use-cases/LogActivity.js';
import type { IActivityLogRepository } from '../../../domain/ports/IActivityLogRepository.js';
import type { User } from '../../../domain/entities/User.js';
import type { AuthVariables, AuthUser } from '../../middleware/authMiddleware.js';

const OWNER_ID = '00000000-0000-0000-0000-000000000001';
const VIEWER_ID = '00000000-0000-0000-0000-000000000002';
const NONEXISTENT_ID = '00000000-0000-0000-0000-000000000099';

const mockUsers: User[] = [
  {
    id: OWNER_ID,
    email: 'owner@test.com',
    displayName: 'Owner',
    passwordHash: 'hash',
    role: 'owner',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: VIEWER_ID,
    email: 'viewer@test.com',
    displayName: 'Viewer',
    passwordHash: 'hash',
    role: 'viewer',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function createApp(actorOverrides?: Partial<AuthUser>) {
  const getAllUsers: GetAllUsers = { execute: vi.fn().mockResolvedValue(mockUsers) } as any;
  const updateUserRole: UpdateUserRole = { execute: vi.fn().mockResolvedValue({ ...mockUsers[1], role: 'editor' }) } as any;
  const deactivateUser: DeactivateUser = { execute: vi.fn().mockResolvedValue({ ...mockUsers[1], isActive: false }) } as any;
  const activityLogRepo: IActivityLogRepository = {
    save: vi.fn().mockResolvedValue({ id: 'log-1', userId: '', action: '', createdAt: new Date() }),
    findAll: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  };
  const logActivity = new LogActivity(activityLogRepo);
  const getActivityLogs = { execute: vi.fn().mockResolvedValue({ logs: [], total: 0 }) } as any;
  const getAdminStats = { execute: vi.fn().mockResolvedValue({ totalUsers: 2, activeUsers: 2, totalIdeas: 0, totalPlans: 0, recentRegistrations: 0, roleDistribution: {} }) } as any;

  const app = new Hono<{ Variables: AuthVariables }>();

  // Simulate global auth guard setting user context
  app.use('*', async (c, next) => {
    const user: AuthUser = {
      userId: OWNER_ID,
      role: 'owner',
      email: 'owner@test.com',
      ...actorOverrides,
    };
    c.set('user', user);
    await next();
  });

  app.route('/api/admin', adminRoutes({ getAllUsers, updateUserRole, deactivateUser, logActivity, getActivityLogs, getAdminStats }));

  return { app, getAllUsers, updateUserRole, deactivateUser, getActivityLogs, getAdminStats };
}

describe('admin routes', () => {
  describe('GET /api/admin/users', () => {
    it('should return list of users for admin+', async () => {
      const { app } = createApp({ role: 'owner' });
      const res = await app.request('/api/admin/users');
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.data.users).toHaveLength(2);
      expect(body.data.total).toBe(2);
      expect(body.data.users[0].email).toBe('owner@test.com');
      // Should NOT include passwordHash
      expect(body.data.users[0].passwordHash).toBeUndefined();
    });

    it('should deny access for editor role', async () => {
      const { app } = createApp({ role: 'editor' });
      const res = await app.request('/api/admin/users');
      expect(res.status).toBe(403);
    });

    it('should deny access for viewer role', async () => {
      const { app } = createApp({ role: 'viewer' });
      const res = await app.request('/api/admin/users');
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/admin/users/:id/role', () => {
    it('should update user role successfully', async () => {
      const { app, updateUserRole } = createApp({ role: 'owner' });
      const res = await app.request(`/api/admin/users/${VIEWER_ID}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'editor' }),
      });
      expect(res.status).toBe(200);
      expect(updateUserRole.execute).toHaveBeenCalled();

      const body = await res.json() as any;
      expect(body.data.role).toBe('editor');
    });

    it('should return 403 for privilege escalation', async () => {
      const { app, updateUserRole } = createApp({ role: 'admin' });
      vi.mocked(updateUserRole.execute).mockRejectedValue(new Error('Cannot assign role equal to or higher than own'));

      const res = await app.request(`/api/admin/users/${VIEWER_ID}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      });
      expect(res.status).toBe(403);
    });

    it('should return 403 for owner role change', async () => {
      const { app, updateUserRole } = createApp({ role: 'admin' });
      vi.mocked(updateUserRole.execute).mockRejectedValue(new Error('Cannot change owner role'));

      const res = await app.request(`/api/admin/users/${OWNER_ID}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'viewer' }),
      });
      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const { app, updateUserRole } = createApp({ role: 'owner' });
      vi.mocked(updateUserRole.execute).mockRejectedValue(new Error('User not found'));

      const res = await app.request(`/api/admin/users/${NONEXISTENT_ID}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'editor' }),
      });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const { app } = createApp({ role: 'owner' });
      const res = await app.request('/api/admin/users/not-a-uuid/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'editor' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/admin/users/:id/deactivate', () => {
    it('should deactivate user successfully', async () => {
      const { app, deactivateUser } = createApp({ role: 'owner' });
      const res = await app.request(`/api/admin/users/${VIEWER_ID}/deactivate`, {
        method: 'POST',
      });
      expect(res.status).toBe(200);
      expect(deactivateUser.execute).toHaveBeenCalled();

      const body = await res.json() as any;
      expect(body.data.isActive).toBe(false);
    });

    it('should return 403 when deactivating owner', async () => {
      const { app, deactivateUser } = createApp({ role: 'admin' });
      vi.mocked(deactivateUser.execute).mockRejectedValue(new Error('Cannot deactivate owner'));

      const res = await app.request(`/api/admin/users/${OWNER_ID}/deactivate`, {
        method: 'POST',
      });
      expect(res.status).toBe(403);
    });

    it('should return 403 when deactivating self', async () => {
      const { app, deactivateUser } = createApp({ role: 'owner' });
      vi.mocked(deactivateUser.execute).mockRejectedValue(new Error('Cannot deactivate own account'));

      const res = await app.request(`/api/admin/users/${OWNER_ID}/deactivate`, {
        method: 'POST',
      });
      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const { app, deactivateUser } = createApp({ role: 'owner' });
      vi.mocked(deactivateUser.execute).mockRejectedValue(new Error('User not found'));

      const res = await app.request(`/api/admin/users/${NONEXISTENT_ID}/deactivate`, {
        method: 'POST',
      });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const { app } = createApp({ role: 'owner' });
      const res = await app.request('/api/admin/users/not-a-uuid/deactivate', {
        method: 'POST',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/admin/stats', () => {
    it('should return admin stats for admin+', async () => {
      const { app } = createApp({ role: 'owner' });
      const res = await app.request('/api/admin/stats');
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.data.stats).toBeDefined();
      expect(body.data.stats.totalUsers).toBe(2);
      expect(body.data.stats.activeUsers).toBe(2);
    });

    it('should deny access for editor', async () => {
      const { app } = createApp({ role: 'editor' });
      const res = await app.request('/api/admin/stats');
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/activity-logs', () => {
    it('should return activity logs for admin+', async () => {
      const { app } = createApp({ role: 'owner' });
      const res = await app.request('/api/admin/activity-logs');
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.data.logs).toBeDefined();
      expect(body.data.total).toBeDefined();
    });

    it('should pass query params to use case', async () => {
      const { app, getActivityLogs } = createApp({ role: 'admin' });
      await app.request('/api/admin/activity-logs?limit=10&offset=5&action=user.login');

      expect(getActivityLogs.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ action: 'user.login' }),
          limit: 10,
          offset: 5,
        }),
      );
    });

    it('should deny access for viewer', async () => {
      const { app } = createApp({ role: 'viewer' });
      const res = await app.request('/api/admin/activity-logs');
      expect(res.status).toBe(403);
    });
  });
});
