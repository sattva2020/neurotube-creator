import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdeaRepository } from '../IdeaRepository.js';
import type { VideoIdea } from '../../../domain/entities/VideoIdea.js';

const mockDbRow = {
  id: 'uuid-1',
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

  const where = vi.fn();
  const orderBy = vi.fn().mockReturnValue({ where });
  const from = vi.fn().mockReturnValue({ orderBy });
  const select = vi.fn().mockReturnValue({ from });

  return {
    insert: insertFn,
    select,
    _chain: { values, returning, from, orderBy, where },
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
    it('should insert ideas and return mapped entities', async () => {
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

      const result = await repo.saveMany(ideas, 'brain hacks');

      expect(db.insert).toHaveBeenCalled();
      expect(db._chain.values).toHaveBeenCalledWith([
        expect.objectContaining({
          title: 'Brain Hacks 101',
          topic: 'brain hacks',
          niche: 'psychology',
        }),
      ]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'uuid-1',
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

      await expect(repo.saveMany([], 'test')).rejects.toThrow('DB insert failed');
    });
  });

  describe('findAll', () => {
    it('should return all ideas when no niche filter', async () => {
      db._chain.orderBy.mockResolvedValue([mockDbRow]);

      const result = await repo.findAll();

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-1');
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
});
