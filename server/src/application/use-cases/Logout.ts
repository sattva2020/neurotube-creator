import type { ISessionRepository } from '../../domain/ports/ISessionRepository.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('Logout');

export interface LogoutInput {
  refreshToken: string;
}

export class Logout {
  constructor(private sessionRepo: ISessionRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    const start = Date.now();
    logger.debug('execute() called');

    await this.sessionRepo.deleteByToken(input.refreshToken);

    const elapsed = Date.now() - start;
    logger.info('execute() completed — session deleted', { elapsed });
  }
}
