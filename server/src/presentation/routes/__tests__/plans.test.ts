import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { plansRoutes } from '../plans.js';
import type { GeneratePlan } from '../../../application/use-cases/GeneratePlan.js';
import type { IPlanRepository } from '../../../domain/ports/IPlanRepository.js';
import type { VideoPlan } from '../../../domain/entities/VideoPlan.js';
import type { AuthVariables } from '../../middleware/authMiddleware.js';

const userId = 'user-uuid-1';

const mockPlan: VideoPlan = {
  id: 'plan-1',
  title: 'Brain Hacks 101',
  markdown: '# Plan\n\nDetailed plan...',
  niche: 'psychology',
  createdAt: new Date('2026-01-01'),
};

describe('Plans Routes', () => {
  let app: Hono<{ Variables: AuthVariables }>;
  let mockGeneratePlan: { execute: ReturnType<typeof vi.fn> };
  let mockPlanRepo: {
    save: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockGeneratePlan = { execute: vi.fn().mockResolvedValue(mockPlan) };
    mockPlanRepo = {
      save: vi.fn().mockResolvedValue(mockPlan),
      findAll: vi.fn().mockResolvedValue([mockPlan]),
      findById: vi.fn().mockResolvedValue(mockPlan),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    app = new Hono<{ Variables: AuthVariables }>();
    // Inject mock auth user
    app.use('*', async (c, next) => {
      c.set('user', { userId, role: 'owner', email: 'test@test.com' });
      await next();
    });
    app.route('/api/plans', plansRoutes(
      mockGeneratePlan as unknown as GeneratePlan,
      mockPlanRepo as unknown as IPlanRepository,
    ));
  });

  describe('POST /api/plans/generate', () => {
    it('should generate plan with valid input and userId', async () => {
      const res = await app.request('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Brain Hacks', hook: 'Your brain rewires every night', niche: 'psychology' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { data: VideoPlan };
      expect(body.data).toEqual(JSON.parse(JSON.stringify(mockPlan)));
      expect(mockGeneratePlan.execute).toHaveBeenCalledWith('Brain Hacks', 'Your brain rewires every night', 'psychology', userId);
    });

    it('should return 400 for missing title', async () => {
      const res = await app.request('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hook: 'some hook', niche: 'psychology' }),
      });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing hook', async () => {
      const res = await app.request('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', niche: 'psychology' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/plans/:id', () => {
    it('should return plan by id scoped to user', async () => {
      const res = await app.request('/api/plans/550e8400-e29b-41d4-a716-446655440000');

      expect(res.status).toBe(200);
      const body = await res.json() as { data: VideoPlan };
      expect(body.data).toEqual(JSON.parse(JSON.stringify(mockPlan)));
      expect(mockPlanRepo.findById).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', userId);
    });

    it('should return 404 when plan not found', async () => {
      mockPlanRepo.findById.mockResolvedValue(null);

      const res = await app.request('/api/plans/550e8400-e29b-41d4-a716-446655440000');

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid uuid', async () => {
      const res = await app.request('/api/plans/not-a-uuid');

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/plans/:id', () => {
    it('should delete plan by id scoped to user', async () => {
      const res = await app.request('/api/plans/550e8400-e29b-41d4-a716-446655440000', {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { success: boolean };
      expect(body.success).toBe(true);
      expect(mockPlanRepo.delete).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', userId);
    });

    it('should return 400 for invalid uuid', async () => {
      const res = await app.request('/api/plans/not-a-uuid', {
        method: 'DELETE',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/plans', () => {
    it('should list all plans for current user', async () => {
      const res = await app.request('/api/plans');

      expect(res.status).toBe(200);
      const body = await res.json() as { data: VideoPlan[] };
      expect(body.data).toHaveLength(1);
      expect(mockPlanRepo.findAll).toHaveBeenCalledWith(userId, undefined);
    });

    it('should filter plans by niche for current user', async () => {
      const res = await app.request('/api/plans?niche=ambient');

      expect(res.status).toBe(200);
      expect(mockPlanRepo.findAll).toHaveBeenCalledWith(userId, 'ambient');
    });
  });
});
