import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { User } from '../../domain/entities/User.js';
import { type Role, ROLE_HIERARCHY } from '../../domain/entities/Role.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('UpdateUserRole');

export interface UpdateUserRoleInput {
  targetUserId: string;
  newRole: Role;
  /** The user performing the action */
  actorId: string;
  actorRole: Role;
}

export class UpdateUserRole {
  constructor(private userRepo: IUserRepository) {}

  async execute(input: UpdateUserRoleInput): Promise<User> {
    const start = Date.now();
    logger.debug('execute() called', {
      targetUserId: input.targetUserId,
      newRole: input.newRole,
      actorId: input.actorId,
      actorRole: input.actorRole,
    });

    // Cannot change own role
    if (input.actorId === input.targetUserId) {
      logger.warn('Self role change attempted', { actorId: input.actorId });
      throw new Error('Cannot change own role');
    }

    const target = await this.userRepo.findById(input.targetUserId);
    if (!target) {
      logger.warn('Target user not found', { targetUserId: input.targetUserId });
      throw new Error('User not found');
    }

    // Owner protection — cannot demote an owner
    if (target.role === 'owner') {
      logger.warn('Attempted to change owner role', { targetUserId: input.targetUserId });
      throw new Error('Cannot change owner role');
    }

    // Privilege escalation prevention — actor cannot assign a role >= their own level
    const actorLevel = ROLE_HIERARCHY[input.actorRole];
    const newRoleLevel = ROLE_HIERARCHY[input.newRole];
    if (newRoleLevel >= actorLevel) {
      logger.warn('Privilege escalation attempted', {
        actorId: input.actorId,
        actorRole: input.actorRole,
        actorLevel,
        newRole: input.newRole,
        newRoleLevel,
      });
      throw new Error('Cannot assign role equal to or higher than own');
    }

    // Actor must outrank the target's current role
    const targetLevel = ROLE_HIERARCHY[target.role];
    if (targetLevel >= actorLevel) {
      logger.warn('Cannot modify user with equal or higher role', {
        actorRole: input.actorRole,
        targetRole: target.role,
      });
      throw new Error('Cannot modify user with equal or higher role');
    }

    const updated = await this.userRepo.updateRole(input.targetUserId, input.newRole);
    if (!updated) {
      throw new Error('Failed to update role');
    }

    const elapsed = Date.now() - start;
    logger.info('execute() completed', {
      targetUserId: input.targetUserId,
      oldRole: target.role,
      newRole: input.newRole,
      actorId: input.actorId,
      elapsed,
    });

    return updated;
  }
}
