import { describe, it, expect } from 'vitest';
import {
  MOCK_IDEAS,
  MOCK_PLAN,
  MOCK_TITLES,
  MOCK_DESCRIPTION,
  MOCK_BRANDING,
  MOCK_SHORTS,
  MOCK_TOOL_MARKDOWN,
  TEST_TOPICS,
  NICHES,
} from '../test-data';

describe('test-data: mock data shapes', () => {
  describe('MOCK_IDEAS', () => {
    it('contains exactly 5 ideas', () => {
      expect(MOCK_IDEAS).toHaveLength(5);
    });

    it('each idea has required VideoIdea fields', () => {
      const requiredFields = [
        'id', 'title', 'hook', 'targetAudience', 'whyItWorks',
        'searchVolume', 'primaryKeyword', 'secondaryKeywords', 'niche', 'createdAt',
      ];

      for (const idea of MOCK_IDEAS) {
        for (const field of requiredFields) {
          expect(idea).toHaveProperty(field);
        }
      }
    });

    it('each idea has valid niche value', () => {
      for (const idea of MOCK_IDEAS) {
        expect(['psychology', 'ambient']).toContain(idea.niche);
      }
    });

    it('each idea has valid searchVolume', () => {
      const validVolumes = ['High', 'Medium', 'Rising Trend'];
      for (const idea of MOCK_IDEAS) {
        expect(validVolumes).toContain(idea.searchVolume);
      }
    });

    it('each idea has non-empty string fields', () => {
      for (const idea of MOCK_IDEAS) {
        expect(idea.id.length).toBeGreaterThan(0);
        expect(idea.title.length).toBeGreaterThan(0);
        expect(idea.hook.length).toBeGreaterThan(0);
        expect(idea.primaryKeyword.length).toBeGreaterThan(0);
      }
    });

    it('each idea has secondaryKeywords as array of strings', () => {
      for (const idea of MOCK_IDEAS) {
        expect(Array.isArray(idea.secondaryKeywords)).toBe(true);
        expect(idea.secondaryKeywords.length).toBeGreaterThan(0);
        for (const kw of idea.secondaryKeywords) {
          expect(typeof kw).toBe('string');
        }
      }
    });

    it('all ideas have unique IDs', () => {
      const ids = MOCK_IDEAS.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('MOCK_PLAN', () => {
    it('has required VideoPlan fields', () => {
      expect(MOCK_PLAN).toHaveProperty('id');
      expect(MOCK_PLAN).toHaveProperty('ideaId');
      expect(MOCK_PLAN).toHaveProperty('title');
      expect(MOCK_PLAN).toHaveProperty('markdown');
      expect(MOCK_PLAN).toHaveProperty('niche');
      expect(MOCK_PLAN).toHaveProperty('createdAt');
    });

    it('has valid niche', () => {
      expect(['psychology', 'ambient']).toContain(MOCK_PLAN.niche);
    });

    it('has non-empty markdown content', () => {
      expect(MOCK_PLAN.markdown.length).toBeGreaterThan(100);
    });

    it('ideaId references a known idea', () => {
      const ideaIds = MOCK_IDEAS.map((i) => i.id);
      expect(ideaIds).toContain(MOCK_PLAN.ideaId);
    });
  });

  describe('MOCK_TITLES', () => {
    it('contains multiple title suggestions', () => {
      expect(MOCK_TITLES.length).toBeGreaterThanOrEqual(3);
    });

    it('each title is a non-empty string', () => {
      for (const title of MOCK_TITLES) {
        expect(typeof title).toBe('string');
        expect(title.length).toBeGreaterThan(0);
      }
    });
  });

  describe('MOCK_BRANDING', () => {
    it('has required ChannelBranding fields', () => {
      expect(MOCK_BRANDING).toHaveProperty('channelNames');
      expect(MOCK_BRANDING).toHaveProperty('seoDescription');
      expect(MOCK_BRANDING).toHaveProperty('avatarPrompt');
      expect(MOCK_BRANDING).toHaveProperty('bannerPrompt');
    });

    it('channelNames is array of strings', () => {
      expect(Array.isArray(MOCK_BRANDING.channelNames)).toBe(true);
      expect(MOCK_BRANDING.channelNames.length).toBeGreaterThan(0);
    });
  });

  describe('MOCK_DESCRIPTION', () => {
    it('is a non-empty string', () => {
      expect(typeof MOCK_DESCRIPTION).toBe('string');
      expect(MOCK_DESCRIPTION.length).toBeGreaterThan(50);
    });
  });

  describe('MOCK_SHORTS', () => {
    it('contains short ideas with title and concept', () => {
      expect(MOCK_SHORTS.length).toBeGreaterThan(0);
      for (const short of MOCK_SHORTS) {
        expect(short).toHaveProperty('title');
        expect(short).toHaveProperty('concept');
      }
    });
  });

  describe('MOCK_TOOL_MARKDOWN', () => {
    it('is valid markdown with formatting', () => {
      expect(MOCK_TOOL_MARKDOWN).toContain('#');
      expect(MOCK_TOOL_MARKDOWN).toContain('**');
      expect(MOCK_TOOL_MARKDOWN).toContain('-');
    });
  });

  describe('Constants', () => {
    it('TEST_TOPICS has both niches', () => {
      expect(TEST_TOPICS).toHaveProperty('psychology');
      expect(TEST_TOPICS).toHaveProperty('ambient');
      expect(TEST_TOPICS.psychology.length).toBeGreaterThan(0);
      expect(TEST_TOPICS.ambient.length).toBeGreaterThan(0);
    });

    it('NICHES has valid values', () => {
      expect(NICHES.psychology).toBe('psychology');
      expect(NICHES.ambient).toBe('ambient');
    });
  });
});
