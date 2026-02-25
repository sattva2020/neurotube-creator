import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { ideasRoutes } from '../ideas.js';
import type { GenerateIdeas } from '../../../application/use-cases/GenerateIdeas.js';
import type { IIdeaRepository } from '../../../domain/ports/IIdeaRepository.js';
import type { VideoIdea } from '../../../domain/entities/VideoIdea.js';

const mockIdeas: VideoIdea[] = [
  {
    title: 'Brain Hacks 101',
    hook: 'Discover surprising brain facts',
    targetAudience: 'Students',
    whyItWorks: 'Curiosity gap',
    searchVolume: 'High',
    primaryKeyword: 'brain hacks',
    secondaryKeywords: ['study tips'],
    niche: 'psychology',
  },
];

describe('Ideas Routes', () => {
  let app: Hono;
  let mockGenerateIdeas: { execute: ReturnType<typeof vi.fn> };
  let mockIdeaRepo: { saveMany: ReturnType<typeof vi.fn>; findAll: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockGenerateIdeas = { execute: vi.fn().mockResolvedValue(mockIdeas) };
    mockIdeaRepo = {
      saveMany: vi.fn().mockResolvedValue(mockIdeas),
      findAll: vi.fn().mockResolvedValue(mockIdeas),
    };

    app = new Hono();
    app.route('/api/ideas', ideasRoutes(
      mockGenerateIdeas as unknown as GenerateIdeas,
      mockIdeaRepo as unknown as IIdeaRepository,
    ));
  });

  describe('POST /api/ideas/generate', () => {
    it('should generate ideas with valid input', async () => {
      const res = await app.request('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'brain hacks', niche: 'psychology' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { data: VideoIdea[] };
      expect(body.data).toEqual(mockIdeas);
      expect(mockGenerateIdeas.execute).toHaveBeenCalledWith('brain hacks', 'psychology');
    });

    it('should return 400 for missing topic', async () => {
      const res = await app.request('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: 'psychology' }),
      });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid niche', async () => {
      const res = await app.request('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'test', niche: 'invalid' }),
      });

      expect(res.status).toBe(400);
    });

    it('should return 400 for empty topic', async () => {
      const res = await app.request('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '', niche: 'psychology' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/ideas', () => {
    it('should list all ideas without filter', async () => {
      const res = await app.request('/api/ideas');

      expect(res.status).toBe(200);
      const body = await res.json() as { data: VideoIdea[] };
      expect(body.data).toEqual(mockIdeas);
      expect(mockIdeaRepo.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter ideas by niche', async () => {
      const res = await app.request('/api/ideas?niche=ambient');

      expect(res.status).toBe(200);
      expect(mockIdeaRepo.findAll).toHaveBeenCalledWith('ambient');
    });
  });
});
