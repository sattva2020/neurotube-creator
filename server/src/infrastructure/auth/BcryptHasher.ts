import bcrypt from 'bcryptjs';
import type { IPasswordHasher } from '../../domain/ports/IPasswordHasher.js';
import { createLogger } from '../logger.js';

const logger = createLogger('BcryptHasher');

export class BcryptHasher implements IPasswordHasher {
  private readonly rounds = 10;

  async hash(password: string): Promise<string> {
    const start = Date.now();
    logger.debug('hash() called');

    const hashed = await bcrypt.hash(password, this.rounds);

    const elapsed = Date.now() - start;
    logger.debug('hash() completed', { rounds: this.rounds, elapsed });
    return hashed;
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const start = Date.now();
    logger.debug('verify() called');

    const match = await bcrypt.compare(password, hash);

    const elapsed = Date.now() - start;
    logger.debug('verify() completed', { match, elapsed });
    return match;
  }
}
