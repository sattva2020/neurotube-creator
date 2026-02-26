import { describe, it, expect } from 'vitest';
import type { Role } from '../entities/Role.js';
import { ROLE_HIERARCHY } from '../entities/Role.js';
import type { User } from '../entities/User.js';
import type { Session } from '../entities/Session.js';

describe('Role value object', () => {
  it('should define all four roles', () => {
    const roles: Role[] = ['owner', 'admin', 'editor', 'viewer'];
    expect(roles).toHaveLength(4);
  });

  it('should have correct hierarchy ordering (owner > admin > editor > viewer)', () => {
    expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.admin);
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.editor);
    expect(ROLE_HIERARCHY.editor).toBeGreaterThan(ROLE_HIERARCHY.viewer);
  });

  it('should allow role comparison for permission checks', () => {
    const userRole: Role = 'editor';
    const requiredRole: Role = 'viewer';
    expect(ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]).toBe(true);
  });

  it('should deny access when role is insufficient', () => {
    const userRole: Role = 'viewer';
    const requiredRole: Role = 'admin';
    expect(ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]).toBe(false);
  });
});

describe('User entity', () => {
  it('should accept a valid User object', () => {
    const user: User = {
      email: 'test@example.com',
      displayName: 'Test User',
      passwordHash: '$2b$10$hashedpassword',
      role: 'viewer',
      isActive: true,
    };

    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('viewer');
    expect(user.isActive).toBe(true);
  });

  it('should support optional id, createdAt, updatedAt fields', () => {
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@example.com',
      displayName: 'Admin',
      passwordHash: '$2b$10$hashedpassword',
      role: 'owner',
      isActive: true,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-16'),
    };

    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should support all role values', () => {
    const roles: Role[] = ['owner', 'admin', 'editor', 'viewer'];
    roles.forEach((role) => {
      const user: User = {
        email: `${role}@example.com`,
        displayName: role,
        passwordHash: 'hash',
        role,
        isActive: true,
      };
      expect(user.role).toBe(role);
    });
  });
});

describe('Session entity', () => {
  it('should accept a valid Session object', () => {
    const session: Session = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      refreshToken: 'random-refresh-token-string',
      expiresAt: new Date('2026-02-01'),
    };

    expect(session.userId).toBeDefined();
    expect(session.refreshToken).toBe('random-refresh-token-string');
    expect(session.expiresAt).toBeInstanceOf(Date);
  });

  it('should support optional id, userAgent, ipAddress, createdAt', () => {
    const session: Session = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      userId: '550e8400-e29b-41d4-a716-446655440000',
      refreshToken: 'token',
      expiresAt: new Date('2026-02-01'),
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.1.1',
      createdAt: new Date('2026-01-25'),
    };

    expect(session.id).toBeDefined();
    expect(session.userAgent).toBe('Mozilla/5.0');
    expect(session.ipAddress).toBe('192.168.1.1');
    expect(session.createdAt).toBeInstanceOf(Date);
  });
});
