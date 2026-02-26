import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Register } from '../Register.js';
import type { IUserRepository } from '../../../domain/ports/IUserRepository.js';
import type { ISessionRepository } from '../../../domain/ports/ISessionRepository.js';
import type { IPasswordHasher } from '../../../domain/ports/IPasswordHasher.js';
import type { ITokenService } from '../../../domain/ports/ITokenService.js';
import type { User } from '../../../domain/entities/User.js';

function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    passwordHash: 'hashed-pw',
    role: 'viewer',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMocks() {
  const userRepo: IUserRepository = {
    save: vi.fn().mockResolvedValue(createMockUser()),
    findByEmail: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(createMockUser()),
    updateRole: vi.fn(),
    updatePassword: vi.fn(),
    deactivate: vi.fn(),
    findAll: vi.fn(),
    count: vi.fn().mockResolvedValue(0),
    countActive: vi.fn().mockResolvedValue(0),
    countByRole: vi.fn().mockResolvedValue({}),
    countSince: vi.fn().mockResolvedValue(0),
  };

  const sessionRepo: ISessionRepository = {
    save: vi.fn().mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      refreshToken: 'refresh-token-123',
      expiresAt: new Date(Date.now() + 7 * 86_400_000),
      createdAt: new Date(),
    }),
    findByToken: vi.fn(),
    deleteByToken: vi.fn(),
    deleteAllByUserId: vi.fn(),
    deleteExpired: vi.fn(),
  };

  const passwordHasher: IPasswordHasher = {
    hash: vi.fn().mockResolvedValue('hashed-pw'),
    verify: vi.fn().mockResolvedValue(true),
  };

  const tokenService: ITokenService = {
    generateAccessToken: vi.fn().mockResolvedValue('access-token'),
    generateRefreshToken: vi.fn().mockReturnValue('refresh-token'),
    verifyAccessToken: vi.fn(),
  };

  return { userRepo, sessionRepo, passwordHasher, tokenService };
}

describe('First-user-owner auto-assignment', () => {
  let mocks: ReturnType<typeof createMocks>;
  let register: Register;

  beforeEach(() => {
    mocks = createMocks();
    register = new Register(
      mocks.userRepo, mocks.passwordHasher, mocks.sessionRepo, mocks.tokenService, '7d',
    );
  });

  it('should assign owner role when no users exist (count === 0)', async () => {
    vi.mocked(mocks.userRepo.count).mockResolvedValue(0);
    vi.mocked(mocks.userRepo.save).mockResolvedValue(createMockUser({ role: 'owner' }));

    const result = await register.execute({
      email: 'first@example.com',
      password: 'password123',
      displayName: 'First User',
    });

    expect(mocks.userRepo.count).toHaveBeenCalled();
    expect(mocks.userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'owner' }),
    );
    expect(result.user.role).toBe('owner');
  });

  it('should assign viewer role when users already exist (count > 0)', async () => {
    vi.mocked(mocks.userRepo.count).mockResolvedValue(1);
    vi.mocked(mocks.userRepo.save).mockResolvedValue(createMockUser({ role: 'viewer' }));

    const result = await register.execute({
      email: 'second@example.com',
      password: 'password123',
      displayName: 'Second User',
    });

    expect(mocks.userRepo.count).toHaveBeenCalled();
    expect(mocks.userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'viewer' }),
    );
    expect(result.user.role).toBe('viewer');
  });

  it('should assign viewer role when many users exist', async () => {
    vi.mocked(mocks.userRepo.count).mockResolvedValue(100);
    vi.mocked(mocks.userRepo.save).mockResolvedValue(createMockUser({ role: 'viewer' }));

    await register.execute({
      email: 'new@example.com',
      password: 'password123',
      displayName: 'New User',
    });

    expect(mocks.userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'viewer' }),
    );
  });
});
