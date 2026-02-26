import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { IIdeaRepository } from '../../domain/ports/IIdeaRepository.js';
import type { IPlanRepository } from '../../domain/ports/IPlanRepository.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GetAdminStats');

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalIdeas: number;
  totalPlans: number;
  recentRegistrations: number;
  roleDistribution: Record<string, number>;
}

export class GetAdminStats {
  constructor(
    private userRepo: IUserRepository,
    private ideaRepo: IIdeaRepository,
    private planRepo: IPlanRepository,
  ) {}

  async execute(): Promise<AdminStats> {
    const start = Date.now();
    logger.debug('execute() called');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalUsers, activeUsers, totalIdeas, totalPlans, recentRegistrations, roleDistribution] =
      await Promise.all([
        this.userRepo.count(),
        this.userRepo.countActive(),
        this.ideaRepo.countAll(),
        this.planRepo.countAll(),
        this.userRepo.countSince(sevenDaysAgo),
        this.userRepo.countByRole(),
      ]);

    const stats: AdminStats = {
      totalUsers,
      activeUsers,
      totalIdeas,
      totalPlans,
      recentRegistrations,
      roleDistribution,
    };

    const elapsed = Date.now() - start;
    logger.info('execute() completed', { ...stats, elapsed });
    return stats;
  }
}
