import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { IPasswordHasher } from '../../domain/ports/IPasswordHasher.js';
import type { ISessionRepository } from '../../domain/ports/ISessionRepository.js';
import type { ITokenService } from '../../domain/ports/ITokenService.js';
import type { User } from '../../domain/entities/User.js';
import { createLogger } from '../../infrastructure/logger.js';
import { parseDuration } from './utils/parseDuration.js';

const logger = createLogger('Login');

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class Login {
  constructor(
    private userRepo: IUserRepository,
    private passwordHasher: IPasswordHasher,
    private sessionRepo: ISessionRepository,
    private tokenService: ITokenService,
    private refreshExpiresIn: string,
  ) {}

  async execute(input: LoginInput, meta?: LoginMeta): Promise<LoginResult> {
    const start = Date.now();
    logger.debug('execute() called', { email: input.email });

    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      logger.info('Login failed — user not found', { email: input.email });
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      logger.info('Login failed — account deactivated', { userId: user.id });
      throw new Error('Account deactivated');
    }

    const valid = await this.passwordHasher.verify(input.password, user.passwordHash);
    if (!valid) {
      logger.info('Login failed — wrong password', { userId: user.id });
      throw new Error('Invalid credentials');
    }

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

    const elapsed = Date.now() - start;
    logger.info('execute() completed — login success', { userId: user.id, elapsed });

    return { user, accessToken, refreshToken };
  }
}
