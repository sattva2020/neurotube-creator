import { SignJWT, jwtVerify } from 'jose';
import crypto from 'node:crypto';
import type { ITokenService, TokenPayload } from '../../domain/ports/ITokenService.js';
import { createLogger } from '../logger.js';

const logger = createLogger('JwtService');

export class JwtService implements ITokenService {
  private readonly secret: Uint8Array;

  constructor(
    secret: string,
    private readonly accessExpiresIn: string,
  ) {
    this.secret = new TextEncoder().encode(secret);
    logger.info('JwtService initialized', { accessExpiresIn });
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    const start = Date.now();
    logger.debug('generateAccessToken() called', { userId: payload.userId, role: payload.role });

    const token = await new SignJWT({
      userId: payload.userId,
      role: payload.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.accessExpiresIn)
      .sign(this.secret);

    const elapsed = Date.now() - start;
    logger.debug('generateAccessToken() completed', { userId: payload.userId, elapsed });
    return token;
  }

  generateRefreshToken(): string {
    logger.debug('generateRefreshToken() called');
    const token = crypto.randomUUID();
    logger.debug('generateRefreshToken() completed');
    return token;
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    const start = Date.now();
    logger.debug('verifyAccessToken() called');

    try {
      const { payload } = await jwtVerify(token, this.secret);

      const userId = payload.userId as string | undefined;
      const role = payload.role as string | undefined;

      if (!userId || !role) {
        logger.warn('verifyAccessToken() invalid payload — missing userId or role');
        return null;
      }

      const elapsed = Date.now() - start;
      logger.debug('verifyAccessToken() success', { userId, role, elapsed });
      return { userId, role: role as TokenPayload['role'] };
    } catch (err) {
      const elapsed = Date.now() - start;
      const message = err instanceof Error ? err.message : 'unknown error';
      logger.debug('verifyAccessToken() failed', { error: message, elapsed });
      return null;
    }
  }
}
