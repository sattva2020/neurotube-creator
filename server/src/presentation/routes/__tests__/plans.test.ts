import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { plansRoutes } from '../plans.js';
import type { GeneratePlan } from '../../../application/use-cases/GeneratePlan.js';
import type { IPlanRepository } from '../../../domain/ports/IPlanRepository.js';
import type { VideoPlan } from '../../../domain/entities/VideoPlan.js';

const mockPlan: VideoPlan = {
  id: 'plan-1',
  title: 'Brain Hacks 101',
  markdown: '# Plan\n\nDetailed plan...',
  niche: 'psychology',
  createdAt: new Date('2026-01-01'),
};

describe('Plans Routes', () => {
  let app: Hono;
  let mockGeneratePlan: { execute: ReturnType<typeof vi.fn> };
  let mockPlanRepo: { save: ReturnType<typeof vi.fn>; findAll: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockGeneratePlan = { execute: vi.fn().mockResolvedValue(mockPlan) };
    mockPlanRepo = {
      save: vi.fn().mockResolvedValue(mockPlan),
      findAll: vi.fn().mockResolvedValue([mockPlan]),
    };

    app = new Hono();
    app.route('/api/plans', plansRoutes(
      mockGeneratePlan as unknown as GeneratePlan,
      mockPlanRepo as unknown as IPlanRepository,
    ));
  });

  describe('POST /api/plans/generate', () => {
    it('should generate plan with valid input', async () => {
      const res = await app.request('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Brain Hacks', hook: 'Your brain rewires every night', niche: 'psychology' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { data: VideoPlan };
      expect(body.data).toEqual(JSON.parse(JSON.stringify(mockPlan)));
      expect(mockGeneratePlan.execute).toHaveBeenCalledWith('Brain Hacks', 'Your brain rewires every night', 'psychology');
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

  describe('GET /api/plans', () => {
    it('should list all plans without filter', async () => {
      const res = await app.request('/api/plans');

      expect(res.status).toBe(200);
      const body = await res.json() as { data: VideoPlan[] };
      expect(body.data).toHaveLength(1);
      expect(mockPlanRepo.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter plans by niche', async () => {
      const res = await app.request('/api/plans?niche=ambient');

      expect(res.status).toBe(200);
      expect(mockPlanRepo.findAll).toHaveBeenCalledWith('ambient');
    });
  });
});
