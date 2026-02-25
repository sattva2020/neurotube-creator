import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IAiService } from '../../../domain/ports/IAiService.js';

import { GenerateTitles } from '../GenerateTitles.js';
import { GenerateBranding } from '../GenerateBranding.js';
import { GenerateThumbnail } from '../GenerateThumbnail.js';
import { AnalyzeNiche } from '../AnalyzeNiche.js';
import { GenerateDescription } from '../GenerateDescription.js';
import { GenerateNotebookLM } from '../GenerateNotebookLM.js';
import { GenerateShorts } from '../GenerateShorts.js';
import { GenerateMonetization } from '../GenerateMonetization.js';
import { GenerateRoadmap } from '../GenerateRoadmap.js';
import { GenerateSunoPrompt } from '../GenerateSunoPrompt.js';

function createMockAiService(): IAiService {
  return {
    generateIdeas: vi.fn(),
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
}

describe('Pure AI Use Cases', () => {
  let aiService: IAiService;

  beforeEach(() => {
    aiService = createMockAiService();
  });

  // -------------------------------------------------------------------------
  // GenerateTitles
  // -------------------------------------------------------------------------

  describe('GenerateTitles', () => {
    it('should delegate to aiService.generateTitles', async () => {
      const titles = ['Title 1', 'Title 2', 'Title 3'];
      (aiService.generateTitles as ReturnType<typeof vi.fn>).mockResolvedValue(titles);

      const useCase = new GenerateTitles(aiService);
      const result = await useCase.execute('brain hacks');

      expect(aiService.generateTitles).toHaveBeenCalledWith('brain hacks');
      expect(result).toEqual(titles);
    });

    it('should propagate errors', async () => {
      (aiService.generateTitles as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

      const useCase = new GenerateTitles(aiService);
      await expect(useCase.execute('test')).rejects.toThrow('fail');
    });
  });

  // -------------------------------------------------------------------------
  // GenerateBranding
  // -------------------------------------------------------------------------

  describe('GenerateBranding', () => {
    it('should delegate to aiService.generateBranding', async () => {
      const branding = {
        channelNames: ['NeuroZone'],
        seoDescription: 'A brain channel',
        avatarPrompt: 'glowing brain',
        bannerPrompt: 'neural network',
      };
      (aiService.generateBranding as ReturnType<typeof vi.fn>).mockResolvedValue(branding);

      const useCase = new GenerateBranding(aiService);
      const result = await useCase.execute('Brain Hacks', 'psychology');

      expect(aiService.generateBranding).toHaveBeenCalledWith('Brain Hacks', 'psychology');
      expect(result).toEqual(branding);
    });

    it('should return null when aiService returns null', async () => {
      (aiService.generateBranding as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const useCase = new GenerateBranding(aiService);
      const result = await useCase.execute('test', 'ambient');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // GenerateThumbnail
  // -------------------------------------------------------------------------

  describe('GenerateThumbnail', () => {
    it('should delegate to aiService.generateThumbnail', async () => {
      const dataUrl = 'data:image/png;base64,abc123';
      (aiService.generateThumbnail as ReturnType<typeof vi.fn>).mockResolvedValue(dataUrl);

      const useCase = new GenerateThumbnail(aiService);
      const result = await useCase.execute('A glowing brain');

      expect(aiService.generateThumbnail).toHaveBeenCalledWith('A glowing brain');
      expect(result).toBe(dataUrl);
    });

    it('should return null when aiService returns null', async () => {
      (aiService.generateThumbnail as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const useCase = new GenerateThumbnail(aiService);
      const result = await useCase.execute('test');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // AnalyzeNiche
  // -------------------------------------------------------------------------

  describe('AnalyzeNiche', () => {
    it('should delegate to aiService.analyzeNiche', async () => {
      const analysis = '## Niche Analysis\n\nDetailed report...';
      (aiService.analyzeNiche as ReturnType<typeof vi.fn>).mockResolvedValue(analysis);

      const useCase = new AnalyzeNiche(aiService);
      const result = await useCase.execute('Brain Hacks', 'psychology');

      expect(aiService.analyzeNiche).toHaveBeenCalledWith('Brain Hacks', 'psychology');
      expect(result).toBe(analysis);
    });

    it('should return null when aiService returns null', async () => {
      (aiService.analyzeNiche as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const useCase = new AnalyzeNiche(aiService);
      const result = await useCase.execute('test', 'ambient');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // GenerateDescription
  // -------------------------------------------------------------------------

  describe('GenerateDescription', () => {
    it('should delegate to aiService.generateDescription', async () => {
      const desc = 'SEO-optimized YouTube description...';
      (aiService.generateDescription as ReturnType<typeof vi.fn>).mockResolvedValue(desc);

      const useCase = new GenerateDescription(aiService);
      const result = await useCase.execute('Brain Hacks', '## Plan', 'psychology');

      expect(aiService.generateDescription).toHaveBeenCalledWith('Brain Hacks', '## Plan', 'psychology');
      expect(result).toBe(desc);
    });

    it('should return null when aiService returns null', async () => {
      (aiService.generateDescription as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const useCase = new GenerateDescription(aiService);
      const result = await useCase.execute('test', '## Plan', 'ambient');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // GenerateNotebookLM
  // -------------------------------------------------------------------------

  describe('GenerateNotebookLM', () => {
    it('should delegate to aiService.generateNotebookLMSource', async () => {
      const source = 'NotebookLM source document...';
      (aiService.generateNotebookLMSource as ReturnType<typeof vi.fn>).mockResolvedValue(source);

      const useCase = new GenerateNotebookLM(aiService);
      const result = await useCase.execute('Brain Hacks', '## Plan', 'psychology');

      expect(aiService.generateNotebookLMSource).toHaveBeenCalledWith('Brain Hacks', '## Plan', 'psychology');
      expect(result).toBe(source);
    });

    it('should return null when aiService returns null', async () => {
      (aiService.generateNotebookLMSource as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const useCase = new GenerateNotebookLM(aiService);
      const result = await useCase.execute('test', '## Plan', 'ambient');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // GenerateShorts
  // -------------------------------------------------------------------------

  describe('GenerateShorts', () => {
    it('should delegate to aiService.generateShortsSpinoffs', async () => {
      const shorts = '## Shorts Ideas\n\n1. Short #1...';
      (aiService.generateShortsSpinoffs as ReturnType<typeof vi.fn>).mockResolvedValue(shorts);

      const useCase = new GenerateShorts(aiService);
      const result = await useCase.execute('Brain Hacks', '## Plan');

      expect(aiService.generateShortsSpinoffs).toHaveBeenCalledWith('Brain Hacks', '## Plan');
      expect(result).toBe(shorts);
    });

    it('should return null when aiService returns null', async () => {
      (aiService.generateShortsSpinoffs as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const useCase = new GenerateShorts(aiService);
      const result = await useCase.execute('test', '## Plan');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // GenerateMonetization
  // -------------------------------------------------------------------------

  describe('GenerateMonetization', () => {
    it('should delegate to aiService.generateMonetizationCopy', async () => {
      const copy = 'Join our Patreon for exclusive content!';
      (aiService.generateMonetizationCopy as ReturnType<typeof vi.fn>).mockResolvedValue(copy);

      const useCase = new GenerateMonetization(aiService);
      const result = await useCase.execute('Brain Hacks', 'psychology');

      expect(aiService.generateMonetizationCopy).toHaveBeenCalledWith('Brain Hacks', 'psychology');
      expect(result).toBe(copy);
    });

    it('should return null when aiService returns null', async () => {
      (aiService.generateMonetizationCopy as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const useCase = new GenerateMonetization(aiService);
      const result = await useCase.execute('test', 'ambient');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // GenerateRoadmap
  // -------------------------------------------------------------------------

  describe('GenerateRoadmap', () => {
    it('should delegate to aiService.generateContentRoadmap', async () => {
      const roadmap = '## 30-Day Content Plan\n\nWeek 1...';
      (aiService.generateContentRoadmap as ReturnType<typeof vi.fn>).mockResolvedValue(roadmap);

      const useCase = new GenerateRoadmap(aiService);
      const result = await useCase.execute('Brain Hacks', 'psychology');

      expect(aiService.generateContentRoadmap).toHaveBeenCalledWith('Brain Hacks', 'psychology');
      expect(result).toBe(roadmap);
    });

    it('should return null when aiService returns null', async () => {
      (aiService.generateContentRoadmap as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const useCase = new GenerateRoadmap(aiService);
      const result = await useCase.execute('test', 'ambient');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // GenerateSunoPrompt
  // -------------------------------------------------------------------------

  describe('GenerateSunoPrompt', () => {
    it('should delegate to aiService.generateSunoPrompt', async () => {
      const prompt = 'ambient drone, 432Hz, deep sleep';
      (aiService.generateSunoPrompt as ReturnType<typeof vi.fn>).mockResolvedValue(prompt);

      const useCase = new GenerateSunoPrompt(aiService);
      const result = await useCase.execute('Sleep Sounds', '## Plan');

      expect(aiService.generateSunoPrompt).toHaveBeenCalledWith('Sleep Sounds', '## Plan');
      expect(result).toBe(prompt);
    });

    it('should return null when aiService returns null', async () => {
      (aiService.generateSunoPrompt as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const useCase = new GenerateSunoPrompt(aiService);
      const result = await useCase.execute('test', '## Plan');

      expect(result).toBeNull();
    });

    it('should propagate errors', async () => {
      (aiService.generateSunoPrompt as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('AI error'));

      const useCase = new GenerateSunoPrompt(aiService);
      await expect(useCase.execute('test', '## Plan')).rejects.toThrow('AI error');
    });
  });
});
