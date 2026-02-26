import type { Role } from './auth.js';

/** Admin dashboard statistics */
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalIdeas: number;
  totalPlans: number;
  recentRegistrations: number;
  roleDistribution: Record<string, number>;
}

/** Single activity log entry */
export interface ActivityLogEntry {
  id: string;
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

/** GET /api/admin/activity-logs response */
export interface ActivityLogsResponse {
  logs: ActivityLogEntry[];
  total: number;
}

/** GET /api/admin/stats response */
export interface AdminStatsResponse {
  stats: AdminStats;
}
