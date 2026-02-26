import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { User } from '../../domain/entities/User.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('GetAllUsers');

export class GetAllUsers {
  constructor(private userRepo: IUserRepository) {}

  async execute(): Promise<User[]> {
    const start = Date.now();
    logger.debug('execute() called');

    const users = await this.userRepo.findAll();

    const elapsed = Date.now() - start;
    logger.info('execute() completed', { count: users.length, elapsed });

    return users;
  }
}
