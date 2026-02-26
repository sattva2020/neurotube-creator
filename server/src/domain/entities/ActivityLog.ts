/** Audit trail entry for admin and user actions */
export interface ActivityLog {
  id?: string;
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt?: Date;
}
