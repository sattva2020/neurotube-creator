import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlanRepository } from '../PlanRepository.js';
import type { VideoPlan } from '../../../domain/entities/VideoPlan.js';

const mockDbRow = {
  id: 'plan-uuid-1',
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
  const findByIdWhere = vi.fn().mockReturnValue({ limit });
  const where = vi.fn();
  const orderBy = vi.fn().mockReturnValue({ where });
  const from = vi.fn().mockReturnValue({ orderBy, where: findByIdWhere });
  const select = vi.fn().mockReturnValue({ from });

  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  const deleteFn = vi.fn().mockReturnValue({ where: deleteWhere });

  return {
    insert: insertFn,
    select,
    delete: deleteFn,
    _chain: { values, returning, from, orderBy, where, findByIdWhere, limit, deleteWhere },
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
    it('should insert a plan and return mapped entity', async () => {
      db._chain.returning.mockResolvedValue([mockDbRow]);

      const plan: VideoPlan = {
        title: 'Brain Hacks 101',
        markdown: '## Plan\n\nDetailed production plan...',
        niche: 'psychology',
        createdAt: new Date(),
      };

      const result = await repo.save(plan);

      expect(db.insert).toHaveBeenCalled();
      expect(db._chain.values).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Brain Hacks 101',
          markdown: '## Plan\n\nDetailed production plan...',
          niche: 'psychology',
          ideaId: null,
        }),
      );
      expect(result).toEqual({
        id: 'plan-uuid-1',
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

      const result = await repo.save(plan);

      expect(db._chain.values).toHaveBeenCalledWith(
        expect.objectContaining({ ideaId: 'idea-uuid-1' }),
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

      await expect(repo.save(plan)).rejects.toThrow('DB insert failed');
    });
  });

  describe('findAll', () => {
    it('should return all plans when no niche filter', async () => {
      db._chain.orderBy.mockResolvedValue([mockDbRow]);

      const result = await repo.findAll();

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('plan-uuid-1');
      expect(result[0].title).toBe('Brain Hacks 101');
    });

    it('should filter by niche when provided', async () => {
      db._chain.where.mockResolvedValue([mockDbRow]);

      const result = await repo.findAll('psychology');

      expect(db._chain.where).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].niche).toBe('psychology');
    });

    it('should propagate database errors', async () => {
      db._chain.orderBy.mockRejectedValue(new Error('DB query failed'));

      await expect(repo.findAll()).rejects.toThrow('DB query failed');
    });
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      db._chain.limit.mockResolvedValue([mockDbRow]);

      const result = await repo.findById('plan-uuid-1');

      expect(db.select).toHaveBeenCalled();
      expect(db._chain.findByIdWhere).toHaveBeenCalled();
      expect(db._chain.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 'plan-uuid-1',
        ideaId: undefined,
        title: 'Brain Hacks 101',
        markdown: '## Plan\n\nDetailed production plan...',
        niche: 'psychology',
        createdAt: new Date('2026-01-01'),
      });
    });

    it('should return null when not found', async () => {
      db._chain.limit.mockResolvedValue([]);

      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('should propagate database errors', async () => {
      db._chain.limit.mockRejectedValue(new Error('DB query failed'));

      await expect(repo.findById('plan-uuid-1')).rejects.toThrow('DB query failed');
    });
  });

  describe('delete', () => {
    it('should call delete with correct id', async () => {
      await repo.delete('plan-uuid-1');

      expect(db.delete).toHaveBeenCalled();
      expect(db._chain.deleteWhere).toHaveBeenCalled();
    });

    it('should propagate database errors', async () => {
      db._chain.deleteWhere.mockRejectedValue(new Error('DB delete failed'));

      await expect(repo.delete('plan-uuid-1')).rejects.toThrow('DB delete failed');
    });
  });
});
