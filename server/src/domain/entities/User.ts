import type { Role } from './Role.js';

/** Registered user in the system */
export interface User {
  id?: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
