import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAdminStats } from '../GetAdminStats.js';
import type { IUserRepository } from '../../../domain/ports/IUserRepository.js';
import type { IIdeaRepository } from '../../../domain/ports/IIdeaRepository.js';
import type { IPlanRepository } from '../../../domain/ports/IPlanRepository.js';

describe('GetAdminStats', () => {
  let userRepo: IUserRepository;
  let ideaRepo: IIdeaRepository;
  let planRepo: IPlanRepository;
  let useCase: GetAdminStats;

  beforeEach(() => {
    userRepo = {
      save: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
      updateRole: vi.fn(),
      updatePassword: vi.fn(),
      deactivate: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn().mockResolvedValue(10),
      countActive: vi.fn().mockResolvedValue(8),
      countByRole: vi.fn().mockResolvedValue({ owner: 1, admin: 2, editor: 3, viewer: 4 }),
      countSince: vi.fn().mockResolvedValue(3),
    };
    ideaRepo = {
      saveMany: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
      countAll: vi.fn().mockResolvedValue(50),
    };
    planRepo = {
      save: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
      countAll: vi.fn().mockResolvedValue(20),
    };
    useCase = new GetAdminStats(userRepo, ideaRepo, planRepo);
  });

  it('should aggregate all stats', async () => {
    const stats = await useCase.execute();

    expect(stats.totalUsers).toBe(10);
    expect(stats.activeUsers).toBe(8);
    expect(stats.totalIdeas).toBe(50);
    expect(stats.totalPlans).toBe(20);
    expect(stats.recentRegistrations).toBe(3);
    expect(stats.roleDistribution).toEqual({ owner: 1, admin: 2, editor: 3, viewer: 4 });
  });

  it('should call countSince with 7 days ago', async () => {
    const before = new Date();
    before.setDate(before.getDate() - 7);

    await useCase.execute();

    const call = vi.mocked(userRepo.countSince).mock.calls[0][0];
    // The date should be approximately 7 days ago (within a second)
    expect(call.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(call.getTime()).toBeLessThanOrEqual(new Date().getTime());
  });
});
