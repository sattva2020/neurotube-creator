import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogActivity } from '../LogActivity.js';
import type { IActivityLogRepository } from '../../../domain/ports/IActivityLogRepository.js';
import type { ActivityLog } from '../../../domain/entities/ActivityLog.js';

describe('LogActivity', () => {
  let activityLogRepo: IActivityLogRepository;
  let useCase: LogActivity;

  const mockLog: ActivityLog = {
    id: '00000000-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000010',
    action: 'user.login',
    resourceType: 'user',
    resourceId: '00000000-0000-0000-0000-000000000010',
    ipAddress: '127.0.0.1',
    createdAt: new Date(),
  };

  beforeEach(() => {
    activityLogRepo = {
      save: vi.fn().mockResolvedValue(mockLog),
      findAll: vi.fn(),
      count: vi.fn(),
    };
    useCase = new LogActivity(activityLogRepo);
  });

  it('should save an activity log entry', async () => {
    const result = await useCase.execute({
      userId: mockLog.userId,
      action: 'user.login',
      resourceType: 'user',
      resourceId: mockLog.resourceId,
      ipAddress: '127.0.0.1',
    });

    expect(activityLogRepo.save).toHaveBeenCalledWith({
      userId: mockLog.userId,
      action: 'user.login',
      resourceType: 'user',
      resourceId: mockLog.resourceId,
      metadata: undefined,
      ipAddress: '127.0.0.1',
    });
    expect(result.id).toBe(mockLog.id);
    expect(result.action).toBe('user.login');
  });

  it('should save with metadata', async () => {
    await useCase.execute({
      userId: mockLog.userId,
      action: 'user.role_updated',
      metadata: { newRole: 'admin' },
    });

    expect(activityLogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'user.role_updated',
        metadata: { newRole: 'admin' },
      }),
    );
  });
});
