import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateIdeas } from '../GenerateIdeas.js';
import type { IAiService } from '../../../domain/ports/IAiService.js';
import type { IIdeaRepository } from '../../../domain/ports/IIdeaRepository.js';
import type { VideoIdea } from '../../../domain/entities/VideoIdea.js';

describe('GenerateIdeas', () => {
  let aiService: IAiService;
  let ideaRepo: IIdeaRepository;
  let useCase: GenerateIdeas;

  const mockIdeas: VideoIdea[] = [
    {
      title: 'Brain Hacks 101',
      hook: 'Did you know your brain rewires itself every night?',
      targetAudience: 'Students',
      whyItWorks: 'Curiosity gap',
      searchVolume: 'High',
      primaryKeyword: 'brain hacks',
      secondaryKeywords: ['study tips', 'memory'],
      niche: 'psychology',
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    aiService = {
      generateIdeas: vi.fn().mockResolvedValue(mockIdeas),
      generatePlan: vi.fn(),
      generateThumbnail: vi.fn(),
      generateTitles: vi.fn(),
      generateBranding: vi.fn(),
      generateNotebookLMSource: vi.fn(),
      generateDescription: vi.fn(),
      generateShortsSpinoffs: vi.fn(),
      analyzeNiche: vi.fn(),
      generateMonetizationCopy: vi.fn(),
      generateContentRoadmap: vi.fn(),
      generateSunoPrompt: vi.fn(),
    };

    ideaRepo = {
      saveMany: vi.fn().mockResolvedValue(mockIdeas),
      findAll: vi.fn(),
    };

    useCase = new GenerateIdeas(aiService, ideaRepo);
  });

  it('should call aiService.generateIdeas with correct args', async () => {
    await useCase.execute('brain hacks', 'psychology');

    expect(aiService.generateIdeas).toHaveBeenCalledWith('brain hacks', 'psychology');
  });

  it('should call ideaRepo.saveMany with ideas and topic', async () => {
    await useCase.execute('brain hacks', 'psychology');

    expect(ideaRepo.saveMany).toHaveBeenCalledWith(mockIdeas, 'brain hacks');
  });

  it('should return saved ideas', async () => {
    const result = await useCase.execute('brain hacks', 'psychology');

    expect(result).toEqual(mockIdeas);
  });

  it('should propagate errors from aiService', async () => {
    (aiService.generateIdeas as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('AI failed'));

    await expect(useCase.execute('test', 'psychology')).rejects.toThrow('AI failed');
  });

  it('should propagate errors from ideaRepo', async () => {
    (ideaRepo.saveMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB failed'));

    await expect(useCase.execute('test', 'psychology')).rejects.toThrow('DB failed');
  });
});
