import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlanRepository } from '../PlanRepository.js';
import type { VideoPlan } from '../../../domain/entities/VideoPlan.js';

const userId = 'user-uuid-1';

const mockDbRow = {
  id: 'plan-uuid-1',
  userId,
  ideaId: null,
  title: 'Brain Hacks 101',
  markdown: '## Plan\n\nDetailed production plan...',
  niche: 'psychology',
  createdAt: new Date('2026-01-01'),
};

function createMockDb() {
  const returning = vi.fn();
  const values = vi.fn().mockReturnValue({ returning });
  const insertFn = vi.fn().mockReturnValue({ values });

  const limit = vi.fn();
  const orderBy = vi.fn();
  const where = vi.fn().mockReturnValue({ orderBy, limit });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });

  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  const deleteFn = vi.fn().mockReturnValue({ where: deleteWhere });

  return {
    insert: insertFn,
    select,
    delete: deleteFn,
    _chain: { values, returning, from, where, orderBy, limit, deleteWhere },
  };
}

describe('PlanRepository', () => {
  let db: ReturnType<typeof createMockDb>;
  let repo: PlanRepository;

  beforeEach(() => {
    db = createMockDb();
    repo = new PlanRepository(db as any);
  });

  describe('save', () => {
    it('should insert a plan with userId and return mapped entity', async () => {
      db._chain.returning.mockResolvedValue([mockDbRow]);

      const plan: VideoPlan = {
        title: 'Brain Hacks 101',
        markdown: '## Plan\n\nDetailed production plan...',
        niche: 'psychology',
        createdAt: new Date(),
      };

      const result = await repo.save(plan, userId);

      expect(db.insert).toHaveBeenCalled();
      expect(db._chain.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          title: 'Brain Hacks 101',
          markdown: '## Plan\n\nDetailed production plan...',
          niche: 'psychology',
          ideaId: null,
        }),
      );
      expect(result).toEqual({
        id: 'plan-uuid-1',
        userId,
        ideaId: undefined,
        title: 'Brain Hacks 101',
        markdown: '## Plan\n\nDetailed production plan...',
        niche: 'psychology',
        createdAt: new Date('2026-01-01'),
      });
    });

    it('should pass ideaId when provided', async () => {
      const rowWithIdeaId = { ...mockDbRow, ideaId: 'idea-uuid-1' };
      db._chain.returning.mockResolvedValue([rowWithIdeaId]);

      const plan: VideoPlan = {
        ideaId: 'idea-uuid-1',
        title: 'Brain Hacks 101',
        markdown: '## Plan',
        niche: 'psychology',
        createdAt: new Date(),
      };

      const result = await repo.save(plan, userId);

      expect(db._chain.values).toHaveBeenCalledWith(
        expect.objectContaining({ userId, ideaId: 'idea-uuid-1' }),
      );
      expect(result.ideaId).toBe('idea-uuid-1');
    });

    it('should propagate database errors', async () => {
      db._chain.returning.mockRejectedValue(new Error('DB insert failed'));

      const plan: VideoPlan = {
        title: 'test',
        markdown: '## Test',
        niche: 'ambient',
        createdAt: new Date(),
      };

      await expect(repo.save(plan, userId)).rejects.toThrow('DB insert failed');
    });
  });

  describe('findAll', () => {
    it('should filter by userId', async () => {
      db._chain.orderBy.mockResolvedValue([mockDbRow]);

      const result = await repo.findAll(userId);

      expect(db.select).toHaveBeenCalled();
      expect(db._chain.where).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('plan-uuid-1');
      expect(result[0].userId).toBe(userId);
    });

    it('should filter by userId and niche when provided', async () => {
      db._chain.orderBy.mockResolvedValue([mockDbRow]);

      const result = await repo.findAll(userId, 'psychology');

      expect(db._chain.where).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].niche).toBe('psychology');
    });

    it('should propagate database errors', async () => {
      db._chain.orderBy.mockRejectedValue(new Error('DB query failed'));

      await expect(repo.findAll(userId)).rejects.toThrow('DB query failed');
    });
  });

  describe('findById', () => {
    it('should return entity when found with userId scope', async () => {
      db._chain.limit.mockResolvedValue([mockDbRow]);

      const result = await repo.findById('plan-uuid-1', userId);

      expect(db.select).toHaveBeenCalled();
      expect(db._chain.where).toHaveBeenCalled();
      expect(db._chain.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 'plan-uuid-1',
        userId,
        ideaId: undefined,
        title: 'Brain Hacks 101',
        markdown: '## Plan\n\nDetailed production plan...',
        niche: 'psychology',
        createdAt: new Date('2026-01-01'),
      });
    });

    it('should return null when not found', async () => {
      db._chain.limit.mockResolvedValue([]);

      const result = await repo.findById('nonexistent', userId);

      expect(result).toBeNull();
    });

    it('should propagate database errors', async () => {
      db._chain.limit.mockRejectedValue(new Error('DB query failed'));

      await expect(repo.findById('plan-uuid-1', userId)).rejects.toThrow('DB query failed');
    });
  });

  describe('delete', () => {
    it('should call delete with userId scope', async () => {
      await repo.delete('plan-uuid-1', userId);

      expect(db.delete).toHaveBeenCalled();
      expect(db._chain.deleteWhere).toHaveBeenCalled();
    });

    it('should propagate database errors', async () => {
      db._chain.deleteWhere.mockRejectedValue(new Error('DB delete failed'));

      await expect(repo.delete('plan-uuid-1', userId)).rejects.toThrow('DB delete failed');
    });
  });
});
