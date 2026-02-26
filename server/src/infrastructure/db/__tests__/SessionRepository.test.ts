import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionRepository } from '../SessionRepository.js';
import type { Session } from '../../../domain/entities/Session.js';

const futureDate = new Date('2027-01-01');
const pastDate = new Date('2025-01-01');

const mockDbRow = {
  id: 'session-1',
  userId: 'user-1',
  refreshToken: 'valid-refresh-token',
  expiresAt: futureDate,
  userAgent: 'Mozilla/5.0',
  ipAddress: '192.168.1.1',
  createdAt: new Date('2026-01-01'),
};

function createMockDb() {
  const returning = vi.fn();
  const values = vi.fn().mockReturnValue({ returning });
  const insertFn = vi.fn().mockReturnValue({ values });

  const limit = vi.fn();
  const findWhere = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where: findWhere });
  const select = vi.fn().mockReturnValue({ from });

  const deleteReturning = vi.fn();
  const deleteWhere = vi.fn().mockReturnValue({ returning: deleteReturning });
  const deleteFn = vi.fn().mockReturnValue({ where: deleteWhere });

  return {
    insert: insertFn,
    select,
    delete: deleteFn,
    _chain: { values, returning, from, findWhere, limit, deleteWhere, deleteReturning },
  };
}

describe('SessionRepository', () => {
  let db: ReturnType<typeof createMockDb>;
  let repo: SessionRepository;

  beforeEach(() => {
    db = createMockDb();
    repo = new SessionRepository(db as any);
  });

  describe('save', () => {
    it('should insert session and return mapped entity', async () => {
      db._chain.returning.mockResolvedValue([mockDbRow]);

      const session: Session = {
        userId: 'user-1',
        refreshToken: 'valid-refresh-token',
        expiresAt: futureDate,
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const result = await repo.save(session);

      expect(db.insert).toHaveBeenCalled();
      expect(result.id).toBe('session-1');
      expect(result.userId).toBe('user-1');
      expect(result.refreshToken).toBe('valid-refresh-token');
    });

    it('should propagate database errors', async () => {
      db._chain.returning.mockRejectedValue(new Error('DB insert failed'));

      const session: Session = {
        userId: 'user-1',
        refreshToken: 'token',
        expiresAt: futureDate,
      };

      await expect(repo.save(session)).rejects.toThrow('DB insert failed');
    });
  });

  describe('findByToken', () => {
    it('should return session for valid non-expired token', async () => {
      db._chain.limit.mockResolvedValue([mockDbRow]);

      const result = await repo.findByToken('valid-refresh-token');

      expect(db.select).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.refreshToken).toBe('valid-refresh-token');
    });

    it('should return null for expired token', async () => {
      db._chain.limit.mockResolvedValue([{ ...mockDbRow, expiresAt: pastDate }]);

      const result = await repo.findByToken('expired-token');

      expect(result).toBeNull();
    });

    it('should return null when token not found', async () => {
      db._chain.limit.mockResolvedValue([]);

      const result = await repo.findByToken('nonexistent-token');

      expect(result).toBeNull();
    });
  });

  describe('deleteByToken', () => {
    it('should delete session by token', async () => {
      db._chain.deleteWhere.mockResolvedValue(undefined);

      await repo.deleteByToken('valid-refresh-token');

      expect(db.delete).toHaveBeenCalled();
      expect(db._chain.deleteWhere).toHaveBeenCalled();
    });
  });

  describe('deleteAllByUserId', () => {
    it('should delete all sessions for a user', async () => {
      db._chain.deleteWhere.mockResolvedValue(undefined);

      await repo.deleteAllByUserId('user-1');

      expect(db.delete).toHaveBeenCalled();
      expect(db._chain.deleteWhere).toHaveBeenCalled();
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired sessions and return count', async () => {
      db._chain.deleteReturning.mockResolvedValue([mockDbRow, mockDbRow]);

      const count = await repo.deleteExpired();

      expect(db.delete).toHaveBeenCalled();
      expect(count).toBe(2);
    });

    it('should return 0 when no expired sessions', async () => {
      db._chain.deleteReturning.mockResolvedValue([]);

      const count = await repo.deleteExpired();

      expect(count).toBe(0);
    });
  });
});
