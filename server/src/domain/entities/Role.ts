/** User role in the system: 4-tier hierarchy Owner → Admin → Editor → Viewer */
export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * Role hierarchy for permission checking.
 * Higher number = more permissions.
 * Usage: ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 40,
  admin: 30,
  editor: 20,
  viewer: 10,
};
