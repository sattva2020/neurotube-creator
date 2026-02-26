import type { ISessionRepository } from '../../domain/ports/ISessionRepository.js';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { ITokenService } from '../../domain/ports/ITokenService.js';
import type { User } from '../../domain/entities/User.js';
import { createLogger } from '../../infrastructure/logger.js';
import { parseDuration } from './utils/parseDuration.js';

const logger = createLogger('RefreshTokens');

export interface RefreshInput {
  refreshToken: string;
}

export interface RefreshMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface RefreshResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokens {
  constructor(
    private sessionRepo: ISessionRepository,
    private userRepo: IUserRepository,
    private tokenService: ITokenService,
    private refreshExpiresIn: string,
  ) {}

  async execute(input: RefreshInput, meta?: RefreshMeta): Promise<RefreshResult> {
    const start = Date.now();
    logger.debug('execute() called');

    const session = await this.sessionRepo.findByToken(input.refreshToken);
    if (!session) {
      logger.warn('Refresh failed — invalid or expired refresh token');
      throw new Error('Invalid refresh token');
    }

    const user = await this.userRepo.findById(session.userId);
    if (!user) {
      logger.warn('Refresh failed — user not found', { userId: session.userId });
      throw new Error('User not found');
    }

    if (!user.isActive) {
      logger.warn('Refresh failed — account deactivated', { userId: user.id });
      throw new Error('Account deactivated');
    }

    // Token rotation: delete old session, create new one
    await this.sessionRepo.deleteByToken(input.refreshToken);
    logger.debug('Old session deleted (token rotation)', { userId: user.id });

    const accessToken = await this.tokenService.generateAccessToken({
      userId: user.id!,
      role: user.role,
    });

    const newRefreshToken = this.tokenService.generateRefreshToken();
    const expiresAt = new Date(Date.now() + parseDuration(this.refreshExpiresIn));

    await this.sessionRepo.save({
      userId: user.id!,
      refreshToken: newRefreshToken,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    const elapsed = Date.now() - start;
    logger.info('execute() completed — tokens rotated', { userId: user.id, elapsed });

    return { user, accessToken, refreshToken: newRefreshToken };
  }
}
