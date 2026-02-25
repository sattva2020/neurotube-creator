import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @google/genai before importing GeminiAiService
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
  Type: {
    STRING: 'STRING',
    OBJECT: 'OBJECT',
    ARRAY: 'ARRAY',
  },
}));

import { GeminiAiService } from '../GeminiAiService.js';

describe('GeminiAiService', () => {
  let service: GeminiAiService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GeminiAiService('test-api-key');
  });

  // -------------------------------------------------------------------------
  // JSON-schema methods
  // -------------------------------------------------------------------------

  describe('generateIdeas', () => {
    it('should parse JSON response and inject niche + createdAt', async () => {
      const mockIdeas = [
        {
          title: 'Test Idea',
          hook: 'Did you know...',
          targetAudience: 'Students',
          whyItWorks: 'Curiosity gap',
          searchVolume: 'High',
          primaryKeyword: 'brain hacks',
          secondaryKeywords: ['study tips', 'memory'],
        },
      ];

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockIdeas),
      });

      const result = await service.generateIdeas('brain hacks', 'psychology');

      expect(result).toHaveLength(1);
      expect(result[0].niche).toBe('psychology');
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].title).toBe('Test Idea');
    });

    it('should return empty array on invalid JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: 'not valid json',
      });

      const result = await service.generateIdeas('test', 'ambient');

      expect(result).toEqual([]);
    });

    it('should return empty array on null response', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: null,
      });

      const result = await service.generateIdeas('test', 'psychology');

      expect(result).toEqual([]);
    });
  });

  describe('generateTitles', () => {
    it('should parse string array response', async () => {
      const titles = ['Title 1', 'Title 2', 'Title 3'];
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(titles),
      });

      const result = await service.generateTitles('brain hacks');

      expect(result).toEqual(titles);
    });

    it('should return empty array on parse failure', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: '{broken' });

      const result = await service.generateTitles('test');

      expect(result).toEqual([]);
    });
  });

  describe('generateBranding', () => {
    it('should parse ChannelBranding JSON', async () => {
      const branding = {
        channelNames: ['NeuroZone', 'BrainPulse'],
        seoDescription: 'A channel about the brain.',
        avatarPrompt: 'A glowing brain icon',
        bannerPrompt: 'Abstract neural network',
      };

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(branding),
      });

      const result = await service.generateBranding('Brain Hacks', 'psychology');

      expect(result).toEqual(branding);
    });

    it('should return null on invalid JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'oops' });

      const result = await service.generateBranding('test', 'ambient');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Text generation methods
  // -------------------------------------------------------------------------

  describe('generatePlan', () => {
    it('should return text response', async () => {
      const planMd = '## Plan\n\nSome plan content';
      mockGenerateContent.mockResolvedValueOnce({ text: planMd });

      const result = await service.generatePlan('Brain Hacks', 'Did you know...', 'psychology');

      expect(result).toBe(planMd);
    });

    it('should return fallback string on empty response', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: null });

      const result = await service.generatePlan('test', 'hook', 'ambient');

      expect(result).toBe('Failed to generate plan.');
    });
  });

  describe('generateDescription', () => {
    it('should return text response', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'SEO description text' });

      const result = await service.generateDescription('Title', '## Plan', 'psychology');

      expect(result).toBe('SEO description text');
    });

    it('should return null on empty response', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: '   ' });

      const result = await service.generateDescription('Title', '## Plan', 'ambient');

      expect(result).toBeNull();
    });
  });

  describe('generateSunoPrompt', () => {
    it('should return prompt string', async () => {
      const sunoPrompt = 'ambient drone, 432Hz, deep sleep';
      mockGenerateContent.mockResolvedValueOnce({ text: sunoPrompt });

      const result = await service.generateSunoPrompt('Sleep Sounds', '## Plan');

      expect(result).toBe(sunoPrompt);
    });
  });

  // -------------------------------------------------------------------------
  // Special methods
  // -------------------------------------------------------------------------

  describe('generateThumbnail', () => {
    it('should return base64 data URL when inlineData present', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: 'iVBORw0KGgo=',
                  },
                },
              ],
            },
          },
        ],
      });

      const result = await service.generateThumbnail('A glowing brain');

      expect(result).toBe('data:image/png;base64,iVBORw0KGgo=');
    });

    it('should return null when no inlineData', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        candidates: [{ content: { parts: [{ text: 'no image' }] } }],
      });

      const result = await service.generateThumbnail('A brain');

      expect(result).toBeNull();
    });

    it('should return null when no candidates', async () => {
      mockGenerateContent.mockResolvedValueOnce({ candidates: [] });

      const result = await service.generateThumbnail('test');

      expect(result).toBeNull();
    });
  });

  describe('analyzeNiche', () => {
    it('should pass googleSearch tool in config', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: '## Analysis report' });

      const result = await service.analyzeNiche('Brain Hacks', 'psychology');

      expect(result).toBe('## Analysis report');

      // Verify the Google Search tool was passed
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.config.tools).toEqual([{ googleSearch: {} }]);
    });

    it('should return null on empty response', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: null });

      const result = await service.analyzeNiche('test', 'ambient');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Model selection
  // -------------------------------------------------------------------------

  describe('model selection', () => {
    it('should use text model for text methods', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: '[]' });

      await service.generateIdeas('test', 'psychology');

      expect(mockGenerateContent.mock.calls[0][0].model).toBe('gemini-3-flash-preview');
    });

    it('should use image model for generateThumbnail', async () => {
      mockGenerateContent.mockResolvedValueOnce({ candidates: [] });

      await service.generateThumbnail('test prompt');

      expect(mockGenerateContent.mock.calls[0][0].model).toBe('gemini-3-pro-image-preview');
    });
  });
});
