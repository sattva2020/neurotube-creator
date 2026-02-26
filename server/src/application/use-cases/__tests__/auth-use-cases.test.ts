import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Register } from '../Register.js';
import { Login } from '../Login.js';
import { RefreshTokens } from '../RefreshTokens.js';
import { Logout } from '../Logout.js';
import type { IUserRepository } from '../../../domain/ports/IUserRepository.js';
import type { ISessionRepository } from '../../../domain/ports/ISessionRepository.js';
import type { IPasswordHasher } from '../../../domain/ports/IPasswordHasher.js';
import type { ITokenService } from '../../../domain/ports/ITokenService.js';
import type { User } from '../../../domain/entities/User.js';
import type { Session } from '../../../domain/entities/Session.js';

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

function createMockSession(overrides?: Partial<Session>): Session {
  return {
    id: 'session-1',
    userId: 'user-1',
    refreshToken: 'refresh-token-123',
    expiresAt: new Date(Date.now() + 7 * 86_400_000),
    createdAt: new Date(),
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
    save: vi.fn().mockResolvedValue(createMockSession()),
    findByToken: vi.fn().mockResolvedValue(createMockSession()),
    deleteByToken: vi.fn().mockResolvedValue(undefined),
    deleteAllByUserId: vi.fn().mockResolvedValue(undefined),
    deleteExpired: vi.fn(),
  };

  const passwordHasher: IPasswordHasher = {
    hash: vi.fn().mockResolvedValue('hashed-pw'),
    verify: vi.fn().mockResolvedValue(true),
  };

  const tokenService: ITokenService = {
    generateAccessToken: vi.fn().mockResolvedValue('access-token-xyz'),
    generateRefreshToken: vi.fn().mockReturnValue('new-refresh-token'),
    verifyAccessToken: vi.fn(),
  };

  return { userRepo, sessionRepo, passwordHasher, tokenService };
}

describe('Register', () => {
  let mocks: ReturnType<typeof createMocks>;
  let register: Register;

  beforeEach(() => {
    mocks = createMocks();
    register = new Register(
      mocks.userRepo, mocks.passwordHasher, mocks.sessionRepo, mocks.tokenService, '7d',
    );
  });

  it('should register a new user and return tokens', async () => {
    const result = await register.execute({
      email: 'new@example.com',
      password: 'password123',
      displayName: 'New User',
    });

    expect(mocks.userRepo.findByEmail).toHaveBeenCalledWith('new@example.com');
    expect(mocks.passwordHasher.hash).toHaveBeenCalledWith('password123');
    expect(mocks.userRepo.save).toHaveBeenCalled();
    expect(mocks.tokenService.generateAccessToken).toHaveBeenCalled();
    expect(mocks.tokenService.generateRefreshToken).toHaveBeenCalled();
    expect(mocks.sessionRepo.save).toHaveBeenCalled();
    expect(result.accessToken).toBe('access-token-xyz');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.user.email).toBe('test@example.com');
  });

  it('should throw if email already exists', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(createMockUser());

    await expect(
      register.execute({ email: 'existing@example.com', password: 'pw', displayName: 'User' }),
    ).rejects.toThrow('User already exists');
  });

  it('should create session with refresh token and meta', async () => {
    await register.execute(
      { email: 'new@example.com', password: 'pw', displayName: 'User' },
      { userAgent: 'Mozilla/5.0', ipAddress: '127.0.0.1' },
    );

    expect(mocks.sessionRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        refreshToken: 'new-refresh-token',
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
      }),
    );
  });
});

describe('Login', () => {
  let mocks: ReturnType<typeof createMocks>;
  let login: Login;

  beforeEach(() => {
    mocks = createMocks();
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(createMockUser());
    login = new Login(
      mocks.userRepo, mocks.passwordHasher, mocks.sessionRepo, mocks.tokenService, '7d',
    );
  });

  it('should log in and return tokens', async () => {
    const result = await login.execute({ email: 'test@example.com', password: 'correct-pw' });

    expect(result.accessToken).toBe('access-token-xyz');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.user.email).toBe('test@example.com');
  });

  it('should throw Invalid credentials for unknown email', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(null);

    await expect(
      login.execute({ email: 'unknown@example.com', password: 'pw' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw Invalid credentials for wrong password', async () => {
    vi.mocked(mocks.passwordHasher.verify).mockResolvedValue(false);

    await expect(
      login.execute({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw Account deactivated for inactive user', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(createMockUser({ isActive: false }));

    await expect(
      login.execute({ email: 'test@example.com', password: 'pw' }),
    ).rejects.toThrow('Account deactivated');
  });
});

describe('RefreshTokens', () => {
  let mocks: ReturnType<typeof createMocks>;
  let refreshTokens: RefreshTokens;

  beforeEach(() => {
    mocks = createMocks();
    refreshTokens = new RefreshTokens(
      mocks.sessionRepo, mocks.userRepo, mocks.tokenService, '7d',
    );
  });

  it('should return new tokens for valid refresh token', async () => {
    const result = await refreshTokens.execute({ refreshToken: 'refresh-token-123' });

    expect(result.accessToken).toBe('access-token-xyz');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.user.id).toBe('user-1');
  });

  it('should throw for invalid refresh token', async () => {
    vi.mocked(mocks.sessionRepo.findByToken).mockResolvedValue(null);

    await expect(
      refreshTokens.execute({ refreshToken: 'bad-token' }),
    ).rejects.toThrow('Invalid refresh token');
  });

  it('should delete old session (token rotation)', async () => {
    await refreshTokens.execute({ refreshToken: 'refresh-token-123' });

    expect(mocks.sessionRepo.deleteByToken).toHaveBeenCalledWith('refresh-token-123');
    expect(mocks.sessionRepo.save).toHaveBeenCalled();
  });

  it('should throw Account deactivated for inactive user', async () => {
    vi.mocked(mocks.userRepo.findById).mockResolvedValue(createMockUser({ isActive: false }));

    await expect(
      refreshTokens.execute({ refreshToken: 'refresh-token-123' }),
    ).rejects.toThrow('Account deactivated');
  });
});

describe('Logout', () => {
  let mocks: ReturnType<typeof createMocks>;
  let logout: Logout;

  beforeEach(() => {
    mocks = createMocks();
    logout = new Logout(mocks.sessionRepo);
  });

  it('should delete session by refresh token', async () => {
    await logout.execute({ refreshToken: 'refresh-token-123' });

    expect(mocks.sessionRepo.deleteByToken).toHaveBeenCalledWith('refresh-token-123');
  });

  it('should not throw for non-existent token (idempotent)', async () => {
    vi.mocked(mocks.sessionRepo.deleteByToken).mockResolvedValue(undefined);

    await expect(
      logout.execute({ refreshToken: 'non-existent-token' }),
    ).resolves.not.toThrow();
  });
});
