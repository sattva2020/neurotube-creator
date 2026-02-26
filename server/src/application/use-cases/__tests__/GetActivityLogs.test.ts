import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetActivityLogs } from '../GetActivityLogs.js';
import type { IActivityLogRepository } from '../../../domain/ports/IActivityLogRepository.js';
import type { ActivityLog } from '../../../domain/entities/ActivityLog.js';

describe('GetActivityLogs', () => {
  let activityLogRepo: IActivityLogRepository;
  let useCase: GetActivityLogs;

  const mockLogs: ActivityLog[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      userId: '00000000-0000-0000-0000-000000000010',
      action: 'user.login',
      createdAt: new Date(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      userId: '00000000-0000-0000-0000-000000000010',
      action: 'user.registered',
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    activityLogRepo = {
      save: vi.fn(),
      findAll: vi.fn().mockResolvedValue(mockLogs),
      count: vi.fn().mockResolvedValue(2),
    };
    useCase = new GetActivityLogs(activityLogRepo);
  });

  it('should return paginated logs with total', async () => {
    const result = await useCase.execute({ limit: 50, offset: 0 });

    expect(result.logs).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(activityLogRepo.findAll).toHaveBeenCalledWith(undefined, 50, 0);
    expect(activityLogRepo.count).toHaveBeenCalledWith(undefined);
  });

  it('should pass filters to repository', async () => {
    const filters = { userId: '00000000-0000-0000-0000-000000000010', action: 'user.login' };
    await useCase.execute({ filters, limit: 10, offset: 5 });

    expect(activityLogRepo.findAll).toHaveBeenCalledWith(filters, 10, 5);
    expect(activityLogRepo.count).toHaveBeenCalledWith(filters);
  });

  it('should use default limit and offset', async () => {
    await useCase.execute({});

    expect(activityLogRepo.findAll).toHaveBeenCalledWith(undefined, 50, 0);
  });
});
