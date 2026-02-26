/** User session for refresh token management */
export interface Session {
  id?: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: Date;
}
