import type { Session } from '../entities/Session.js';

/** Repository contract for session (refresh token) persistence */
export interface ISessionRepository {
  /** Save a new session */
  save(session: Session): Promise<Session>;

  /** Find session by refresh token (must check expiresAt > now) */
  findByToken(refreshToken: string): Promise<Session | null>;

  /** Delete session by refresh token (logout) */
  deleteByToken(refreshToken: string): Promise<void>;

  /** Delete all sessions for a user (force logout everywhere) */
  deleteAllByUserId(userId: string): Promise<void>;

  /** Delete all expired sessions (cleanup) */
  deleteExpired(): Promise<number>;
}
