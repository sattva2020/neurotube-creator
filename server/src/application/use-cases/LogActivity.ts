import type { IActivityLogRepository } from '../../domain/ports/IActivityLogRepository.js';
import type { ActivityLog } from '../../domain/entities/ActivityLog.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('LogActivity');

export interface LogActivityInput {
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export class LogActivity {
  constructor(private activityLogRepo: IActivityLogRepository) {}

  async execute(input: LogActivityInput): Promise<ActivityLog> {
    const start = Date.now();
    logger.debug('execute() called', { userId: input.userId, action: input.action });

    const log = await this.activityLogRepo.save({
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: input.metadata,
      ipAddress: input.ipAddress,
    });

    const elapsed = Date.now() - start;
    logger.info('execute() completed', { id: log.id, action: log.action, elapsed });
    return log;
  }
}
