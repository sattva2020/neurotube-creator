import type { User } from '../entities/User.js';
import type { Role } from '../entities/Role.js';

/** Repository contract for user persistence */
export interface IUserRepository {
  /** Create a new user */
  save(user: User): Promise<User>;

  /** Find user by email (for login) */
  findByEmail(email: string): Promise<User | null>;

  /** Find user by ID */
  findById(id: string): Promise<User | null>;

  /** Update user role */
  updateRole(id: string, role: Role): Promise<User | null>;

  /** Update user password hash */
  updatePassword(id: string, passwordHash: string): Promise<User | null>;

  /** Deactivate user (soft delete) */
  deactivate(id: string): Promise<User | null>;

  /** List all users (admin) */
  findAll(): Promise<User[]>;

  /** Count total users (for first-user-owner check) */
  count(): Promise<number>;
}
