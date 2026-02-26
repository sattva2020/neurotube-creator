import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdeaRepository } from '../IdeaRepository.js';
import type { VideoIdea } from '../../../domain/entities/VideoIdea.js';

const userId = 'user-uuid-1';
const otherUserId = 'user-uuid-2';

const mockDbRow = {
  id: 'uuid-1',
  userId,
  title: 'Brain Hacks 101',
  hook: 'Did you know your brain rewires itself?',
  targetAudience: 'Students',
  whyItWorks: 'Curiosity gap',
  searchVolume: 'High',
  primaryKeyword: 'brain hacks',
  secondaryKeywords: ['study tips', 'memory'],
  niche: 'psychology',
  topic: 'brain hacks',
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

describe('IdeaRepository', () => {
  let db: ReturnType<typeof createMockDb>;
  let repo: IdeaRepository;

  beforeEach(() => {
    db = createMockDb();
    repo = new IdeaRepository(db as any);
  });

  describe('saveMany', () => {
    it('should insert ideas with userId and return mapped entities', async () => {
      db._chain.returning.mockResolvedValue([mockDbRow]);

      const ideas: VideoIdea[] = [
        {
          title: 'Brain Hacks 101',
          hook: 'Did you know your brain rewires itself?',
          targetAudience: 'Students',
          whyItWorks: 'Curiosity gap',
          searchVolume: 'High',
          primaryKeyword: 'brain hacks',
          secondaryKeywords: ['study tips', 'memory'],
          niche: 'psychology',
        },
      ];

      const result = await repo.saveMany(ideas, 'brain hacks', userId);

      expect(db.insert).toHaveBeenCalled();
      expect(db._chain.values).toHaveBeenCalledWith([
        expect.objectContaining({
          userId,
          title: 'Brain Hacks 101',
          topic: 'brain hacks',
          niche: 'psychology',
        }),
      ]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'uuid-1',
        userId,
        title: 'Brain Hacks 101',
        hook: 'Did you know your brain rewires itself?',
        targetAudience: 'Students',
        whyItWorks: 'Curiosity gap',
        searchVolume: 'High',
        primaryKeyword: 'brain hacks',
        secondaryKeywords: ['study tips', 'memory'],
        niche: 'psychology',
        createdAt: new Date('2026-01-01'),
      });
    });

    it('should propagate database errors', async () => {
      db._chain.returning.mockRejectedValue(new Error('DB insert failed'));

      await expect(repo.saveMany([], 'test', userId)).rejects.toThrow('DB insert failed');
    });
  });

  describe('findAll', () => {
    it('should filter by userId', async () => {
      db._chain.orderBy.mockResolvedValue([mockDbRow]);

      const result = await repo.findAll(userId);

      expect(db.select).toHaveBeenCalled();
      expect(db._chain.where).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-1');
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

      const result = await repo.findById('uuid-1', userId);

      expect(db.select).toHaveBeenCalled();
      expect(db._chain.where).toHaveBeenCalled();
      expect(db._chain.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 'uuid-1',
        userId,
        title: 'Brain Hacks 101',
        hook: 'Did you know your brain rewires itself?',
        targetAudience: 'Students',
        whyItWorks: 'Curiosity gap',
        searchVolume: 'High',
        primaryKeyword: 'brain hacks',
        secondaryKeywords: ['study tips', 'memory'],
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

      await expect(repo.findById('uuid-1', userId)).rejects.toThrow('DB query failed');
    });
  });

  describe('delete', () => {
    it('should call delete with userId scope', async () => {
      await repo.delete('uuid-1', userId);

      expect(db.delete).toHaveBeenCalled();
      expect(db._chain.deleteWhere).toHaveBeenCalled();
    });

    it('should propagate database errors', async () => {
      db._chain.deleteWhere.mockRejectedValue(new Error('DB delete failed'));

      await expect(repo.delete('uuid-1', userId)).rejects.toThrow('DB delete failed');
    });
  });
});
