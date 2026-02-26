import type { ActivityLog } from '../entities/ActivityLog.js';

export interface ActivityLogFilters {
  userId?: string;
  action?: string;
}

/** Repository contract for activity log persistence */
export interface IActivityLogRepository {
  /** Save a new activity log entry */
  save(log: ActivityLog): Promise<ActivityLog>;

  /** Retrieve paginated activity logs with optional filters */
  findAll(filters?: ActivityLogFilters, limit?: number, offset?: number): Promise<ActivityLog[]>;

  /** Count total activity logs matching optional filters */
  count(filters?: ActivityLogFilters): Promise<number>;
}
