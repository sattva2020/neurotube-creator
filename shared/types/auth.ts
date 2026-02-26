/** User role in the system: 4-tier hierarchy Owner → Admin → Editor → Viewer */
export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

/** Public user data (no sensitive fields like passwordHash) */
export interface UserPublic {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
}

/** Login request payload */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Registration request payload */
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

/** JWT token pair */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Full auth response (login/register) */
export interface AuthResponse {
  user: UserPublic;
  tokens: AuthTokens;
}
