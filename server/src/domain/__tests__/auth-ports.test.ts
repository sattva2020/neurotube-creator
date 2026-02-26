import { describe, it, expect, vi } from 'vitest';
import type { IUserRepository } from '../ports/IUserRepository.js';
import type { ISessionRepository } from '../ports/ISessionRepository.js';
import type { IPasswordHasher } from '../ports/IPasswordHasher.js';
import type { User } from '../entities/User.js';
import type { Session } from '../entities/Session.js';

describe('IUserRepository port', () => {
  it('should be satisfiable with a mock implementation', () => {
    const mockUser: User = {
      id: 'uuid-1',
      email: 'test@example.com',
      displayName: 'Test',
      passwordHash: 'hash',
      role: 'viewer',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const repo: IUserRepository = {
      save: vi.fn().mockResolvedValue(mockUser),
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn().mockResolvedValue(mockUser),
      updateRole: vi.fn().mockResolvedValue(mockUser),
      updatePassword: vi.fn().mockResolvedValue(mockUser),
      deactivate: vi.fn().mockResolvedValue(mockUser),
      findAll: vi.fn().mockResolvedValue([mockUser]),
      count: vi.fn().mockResolvedValue(1),
      countActive: vi.fn().mockResolvedValue(0),
      countByRole: vi.fn().mockResolvedValue({}),
      countSince: vi.fn().mockResolvedValue(0),
    };

    expect(repo.save).toBeDefined();
    expect(repo.findByEmail).toBeDefined();
    expect(repo.findById).toBeDefined();
    expect(repo.updateRole).toBeDefined();
    expect(repo.updatePassword).toBeDefined();
    expect(repo.deactivate).toBeDefined();
    expect(repo.findAll).toBeDefined();
    expect(repo.count).toBeDefined();
  });

  it('should support null returns for lookup methods', async () => {
    const repo: IUserRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn().mockResolvedValue(null),
      updateRole: vi.fn().mockResolvedValue(null),
      updatePassword: vi.fn().mockResolvedValue(null),
      deactivate: vi.fn().mockResolvedValue(null),
      findAll: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      countActive: vi.fn().mockResolvedValue(0),
      countByRole: vi.fn().mockResolvedValue({}),
      countSince: vi.fn().mockResolvedValue(0),
    };

    expect(await repo.findByEmail('nonexistent@test.com')).toBeNull();
    expect(await repo.findById('nonexistent')).toBeNull();
  });
});

describe('ISessionRepository port', () => {
  it('should be satisfiable with a mock implementation', () => {
    const mockSession: Session = {
      id: 'uuid-1',
      userId: 'user-uuid-1',
      refreshToken: 'token',
      expiresAt: new Date('2026-03-01'),
      createdAt: new Date(),
    };

    const repo: ISessionRepository = {
      save: vi.fn().mockResolvedValue(mockSession),
      findByToken: vi.fn().mockResolvedValue(mockSession),
      deleteByToken: vi.fn().mockResolvedValue(undefined),
      deleteAllByUserId: vi.fn().mockResolvedValue(undefined),
      deleteExpired: vi.fn().mockResolvedValue(3),
    };

    expect(repo.save).toBeDefined();
    expect(repo.findByToken).toBeDefined();
    expect(repo.deleteByToken).toBeDefined();
    expect(repo.deleteAllByUserId).toBeDefined();
    expect(repo.deleteExpired).toBeDefined();
  });

  it('should return null for expired or missing tokens', async () => {
    const repo: ISessionRepository = {
      save: vi.fn(),
      findByToken: vi.fn().mockResolvedValue(null),
      deleteByToken: vi.fn(),
      deleteAllByUserId: vi.fn(),
      deleteExpired: vi.fn().mockResolvedValue(0),
    };

    expect(await repo.findByToken('expired-token')).toBeNull();
  });
});

describe('IPasswordHasher port', () => {
  it('should be satisfiable with a mock implementation', async () => {
    const hasher: IPasswordHasher = {
      hash: vi.fn().mockResolvedValue('$2b$10$hashed'),
      verify: vi.fn().mockResolvedValue(true),
    };

    const hashed = await hasher.hash('password123');
    expect(hashed).toBe('$2b$10$hashed');

    const valid = await hasher.verify('password123', hashed);
    expect(valid).toBe(true);
  });

  it('should return false for invalid password', async () => {
    const hasher: IPasswordHasher = {
      hash: vi.fn().mockResolvedValue('$2b$10$hashed'),
      verify: vi.fn().mockResolvedValue(false),
    };

    const valid = await hasher.verify('wrong-password', '$2b$10$hashed');
    expect(valid).toBe(false);
  });
});
