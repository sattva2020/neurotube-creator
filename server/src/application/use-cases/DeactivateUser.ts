import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { User } from '../../domain/entities/User.js';
import { ROLE_HIERARCHY } from '../../domain/entities/Role.js';
import type { Role } from '../../domain/entities/Role.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('DeactivateUser');

export interface DeactivateUserInput {
  targetUserId: string;
  /** The user performing the action */
  actorId: string;
  actorRole: Role;
}

export class DeactivateUser {
  constructor(private userRepo: IUserRepository) {}

  async execute(input: DeactivateUserInput): Promise<User> {
    const start = Date.now();
    logger.debug('execute() called', {
      targetUserId: input.targetUserId,
      actorId: input.actorId,
      actorRole: input.actorRole,
    });

    // Cannot deactivate self
    if (input.actorId === input.targetUserId) {
      logger.warn('Self deactivation attempted', { actorId: input.actorId });
      throw new Error('Cannot deactivate own account');
    }

    const target = await this.userRepo.findById(input.targetUserId);
    if (!target) {
      logger.warn('Target user not found', { targetUserId: input.targetUserId });
      throw new Error('User not found');
    }

    // Owner protection — cannot deactivate an owner
    if (target.role === 'owner') {
      logger.warn('Attempted to deactivate owner', { targetUserId: input.targetUserId });
      throw new Error('Cannot deactivate owner');
    }

    // Actor must outrank the target
    const actorLevel = ROLE_HIERARCHY[input.actorRole];
    const targetLevel = ROLE_HIERARCHY[target.role];
    if (targetLevel >= actorLevel) {
      logger.warn('Cannot deactivate user with equal or higher role', {
        actorRole: input.actorRole,
        targetRole: target.role,
      });
      throw new Error('Cannot deactivate user with equal or higher role');
    }

    if (!target.isActive) {
      logger.info('User already deactivated', { targetUserId: input.targetUserId });
      return target;
    }

    const deactivated = await this.userRepo.deactivate(input.targetUserId);
    if (!deactivated) {
      throw new Error('Failed to deactivate user');
    }

    const elapsed = Date.now() - start;
    logger.info('execute() completed', {
      targetUserId: input.targetUserId,
      actorId: input.actorId,
      elapsed,
    });

    return deactivated;
  }
}
