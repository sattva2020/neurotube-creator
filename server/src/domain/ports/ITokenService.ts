import type { Role } from '../entities/Role.js';

/** Payload embedded in JWT access tokens */
export interface TokenPayload {
  userId: string;
  role: Role;
}

/** Contract for JWT token generation and verification */
export interface ITokenService {
  /** Generate a short-lived access token with user info */
  generateAccessToken(payload: TokenPayload): Promise<string>;

  /** Generate a cryptographically random refresh token */
  generateRefreshToken(): string;

  /** Verify and decode an access token; returns null if invalid/expired */
  verifyAccessToken(token: string): Promise<TokenPayload | null>;
}
