import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '../UserRepository.js';
import type { User } from '../../../domain/entities/User.js';

const mockDbRow = {
  id: 'uuid-1',
  email: 'user@example.com',
  displayName: 'Test User',
  passwordHash: '$2b$10$hashedpassword',
  role: 'viewer',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function createMockDb() {
  const returning = vi.fn();
  const values = vi.fn().mockReturnValue({ returning });
  const insertFn = vi.fn().mockReturnValue({ values });

  const limit = vi.fn();
  const findWhere = vi.fn().mockReturnValue({ limit });
  const orderBy = vi.fn();
  const from = vi.fn().mockReturnValue({ orderBy, where: findWhere });
  const select = vi.fn().mockReturnValue({ from });

  const updateReturning = vi.fn();
  const updateWhere = vi.fn().mockReturnValue({ returning: updateReturning });
  const set = vi.fn().mockReturnValue({ where: updateWhere });
  const update = vi.fn().mockReturnValue({ set });

  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  const deleteFn = vi.fn().mockReturnValue({ where: deleteWhere });

  return {
    insert: insertFn,
    select,
    update,
    delete: deleteFn,
    _chain: { values, returning, from, orderBy, findWhere, limit, set, updateWhere, updateReturning, deleteWhere },
  };
}

describe('UserRepository', () => {
  let db: ReturnType<typeof createMockDb>;
  let repo: UserRepository;

  beforeEach(() => {
    db = createMockDb();
    repo = new UserRepository(db as any);
  });

  describe('save', () => {
    it('should insert user and return mapped entity', async () => {
      db._chain.returning.mockResolvedValue([mockDbRow]);

      const user: User = {
        email: 'user@example.com',
        displayName: 'Test User',
        passwordHash: '$2b$10$hashedpassword',
        role: 'viewer',
        isActive: true,
      };

      const result = await repo.save(user);

      expect(db.insert).toHaveBeenCalled();
      expect(db._chain.values).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          displayName: 'Test User',
          role: 'viewer',
        }),
      );
      expect(result.id).toBe('uuid-1');
      expect(result.email).toBe('user@example.com');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should propagate database errors', async () => {
      db._chain.returning.mockRejectedValue(new Error('DB insert failed'));

      const user: User = {
        email: 'fail@example.com',
        displayName: 'Fail',
        passwordHash: 'hash',
        role: 'viewer',
        isActive: true,
      };

      await expect(repo.save(user)).rejects.toThrow('DB insert failed');
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      db._chain.limit.mockResolvedValue([mockDbRow]);

      const result = await repo.findByEmail('user@example.com');

      expect(db.select).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.email).toBe('user@example.com');
    });

    it('should return null when not found', async () => {
      db._chain.limit.mockResolvedValue([]);

      const result = await repo.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      db._chain.limit.mockResolvedValue([mockDbRow]);

      const result = await repo.findById('uuid-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('uuid-1');
    });

    it('should return null when not found', async () => {
      db._chain.limit.mockResolvedValue([]);

      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateRole', () => {
    it('should update role and return updated user', async () => {
      db._chain.updateReturning.mockResolvedValue([{ ...mockDbRow, role: 'admin' }]);

      const result = await repo.updateRole('uuid-1', 'admin');

      expect(db.update).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.role).toBe('admin');
    });

    it('should return null when user not found', async () => {
      db._chain.updateReturning.mockResolvedValue([]);

      const result = await repo.updateRole('nonexistent', 'admin');

      expect(result).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should update password hash and return updated user', async () => {
      db._chain.updateReturning.mockResolvedValue([{ ...mockDbRow, passwordHash: 'new-hash' }]);

      const result = await repo.updatePassword('uuid-1', 'new-hash');

      expect(db.update).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.passwordHash).toBe('new-hash');
    });

    it('should return null when user not found', async () => {
      db._chain.updateReturning.mockResolvedValue([]);

      const result = await repo.updatePassword('nonexistent', 'new-hash');

      expect(result).toBeNull();
    });
  });

  describe('deactivate', () => {
    it('should set isActive to false and return updated user', async () => {
      db._chain.updateReturning.mockResolvedValue([{ ...mockDbRow, isActive: false }]);

      const result = await repo.deactivate('uuid-1');

      expect(result).not.toBeNull();
      expect(result!.isActive).toBe(false);
    });

    it('should return null when user not found', async () => {
      db._chain.updateReturning.mockResolvedValue([]);

      const result = await repo.deactivate('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      db._chain.orderBy.mockResolvedValue([mockDbRow, { ...mockDbRow, id: 'uuid-2', email: 'second@example.com' }]);

      const result = await repo.findAll();

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('uuid-1');
      expect(result[1].id).toBe('uuid-2');
    });

    it('should return empty array when no users', async () => {
      db._chain.orderBy.mockResolvedValue([]);

      const result = await repo.findAll();

      expect(result).toHaveLength(0);
    });
  });
});
