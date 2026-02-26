import type { IActivityLogRepository, ActivityLogFilters } from '../../domain/ports/IActivityLogRepository.js';
import type { ActivityLog } from '../../domain/entities/ActivityLog.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GetActivityLogs');

export interface GetActivityLogsInput {
  filters?: ActivityLogFilters;
  limit?: number;
  offset?: number;
}

export interface GetActivityLogsOutput {
  logs: ActivityLog[];
  total: number;
}

export class GetActivityLogs {
  constructor(private activityLogRepo: IActivityLogRepository) {}

  async execute(input: GetActivityLogsInput = {}): Promise<GetActivityLogsOutput> {
    const start = Date.now();
    const { filters, limit = 50, offset = 0 } = input;
    logger.debug('execute() called', { filters, limit, offset });

    const [logs, total] = await Promise.all([
      this.activityLogRepo.findAll(filters, limit, offset),
      this.activityLogRepo.count(filters),
    ]);

    const elapsed = Date.now() - start;
    logger.info('execute() completed', { count: logs.length, total, elapsed });
    return { logs, total };
  }
}
