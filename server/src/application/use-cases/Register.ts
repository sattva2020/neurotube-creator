import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { IPasswordHasher } from '../../domain/ports/IPasswordHasher.js';
import type { ISessionRepository } from '../../domain/ports/ISessionRepository.js';
import type { ITokenService } from '../../domain/ports/ITokenService.js';
import type { User } from '../../domain/entities/User.js';
import { createLogger } from '../../infrastructure/logger.js';
import { parseDuration } from './utils/parseDuration.js';

const logger = createLogger('Register');

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface RegisterMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface RegisterResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class Register {
  constructor(
    private userRepo: IUserRepository,
    private passwordHasher: IPasswordHasher,
    private sessionRepo: ISessionRepository,
    private tokenService: ITokenService,
    private refreshExpiresIn: string,
  ) {}

  async execute(input: RegisterInput, meta?: RegisterMeta): Promise<RegisterResult> {
    const start = Date.now();
    logger.debug('execute() called', { email: input.email });

    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      logger.warn('execute() user already exists', { email: input.email });
      throw new Error('User already exists');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    logger.debug('Password hashed');

    let user;
    try {
      user = await this.userRepo.save({
        email: input.email,
        displayName: input.displayName,
        passwordHash,
        role: 'viewer',
        isActive: true,
      });
    } catch (err) {
      // Handle DB unique constraint violation (race condition between findByEmail and save)
      const message = err instanceof Error ? err.message : '';
      if (message.includes('unique') || message.includes('duplicate')) {
        logger.warn('execute() race condition — duplicate email', { email: input.email });
        throw new Error('User already exists');
      }
      throw err;
    }
    logger.info('User created', { userId: user.id, email: user.email, role: user.role });

    const accessToken = await this.tokenService.generateAccessToken({
      userId: user.id!,
      role: user.role,
    });

    const refreshToken = this.tokenService.generateRefreshToken();
    const expiresAt = new Date(Date.now() + parseDuration(this.refreshExpiresIn));

    await this.sessionRepo.save({
      userId: user.id!,
      refreshToken,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });
    logger.debug('Session created', { userId: user.id });

    const elapsed = Date.now() - start;
    logger.info('execute() completed', { userId: user.id, elapsed });

    return { user, accessToken, refreshToken };
  }
}
