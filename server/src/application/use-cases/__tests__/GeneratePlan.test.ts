import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeneratePlan } from '../GeneratePlan.js';
import type { IAiService } from '../../../domain/ports/IAiService.js';
import type { IPlanRepository } from '../../../domain/ports/IPlanRepository.js';
import type { VideoPlan } from '../../../domain/entities/VideoPlan.js';

describe('GeneratePlan', () => {
  let aiService: IAiService;
  let planRepo: IPlanRepository;
  let useCase: GeneratePlan;

  const planMarkdown = '## Plan\n\nDetailed production plan...';

  const savedPlan: VideoPlan = {
    id: 'plan-123',
    title: 'Brain Hacks 101',
    markdown: planMarkdown,
    niche: 'psychology',
    createdAt: new Date(),
  };

  beforeEach(() => {
    aiService = {
      generateIdeas: vi.fn(),
      generatePlan: vi.fn().mockResolvedValue(planMarkdown),
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

    planRepo = {
      save: vi.fn().mockResolvedValue(savedPlan),
      findAll: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new GeneratePlan(aiService, planRepo);
  });

  const userId = 'user-uuid-1';

  it('should call aiService.generatePlan with correct args', async () => {
    await useCase.execute('Brain Hacks 101', 'Did you know...', 'psychology', userId);

    expect(aiService.generatePlan).toHaveBeenCalledWith('Brain Hacks 101', 'Did you know...', 'psychology');
  });

  it('should create VideoPlan and call planRepo.save with userId', async () => {
    await useCase.execute('Brain Hacks 101', 'Did you know...', 'psychology', userId);

    expect(planRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Brain Hacks 101',
        markdown: planMarkdown,
        niche: 'psychology',
        createdAt: expect.any(Date),
      }),
      userId,
    );
  });

  it('should return saved plan', async () => {
    const result = await useCase.execute('Brain Hacks 101', 'Did you know...', 'psychology', userId);

    expect(result).toEqual(savedPlan);
    expect(result.id).toBe('plan-123');
  });

  it('should propagate errors from aiService', async () => {
    (aiService.generatePlan as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('AI failed'));

    await expect(useCase.execute('test', 'hook', 'psychology', userId)).rejects.toThrow('AI failed');
  });

  it('should propagate errors from planRepo', async () => {
    (planRepo.save as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB failed'));

    await expect(useCase.execute('test', 'hook', 'ambient', userId)).rejects.toThrow('DB failed');
  });
});
