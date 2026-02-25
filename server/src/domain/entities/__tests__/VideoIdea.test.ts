import { describe, it, expect } from 'vitest';
import type { VideoIdea } from '../VideoIdea.js';
import type { Niche } from '../Niche.js';

describe('VideoIdea entity', () => {
  it('should accept a valid VideoIdea object', () => {
    const idea: VideoIdea = {
      title: 'Why Your Brain Sabotages You',
      hook: 'Your brain is lying to you right now.',
      targetAudience: 'People struggling with self-discipline',
      whyItWorks: 'Exploits curiosity gap about self-sabotage',
      searchVolume: 'High',
      primaryKeyword: 'self sabotage psychology',
      secondaryKeywords: ['why do I procrastinate', 'brain tricks'],
      niche: 'psychology',
    };

    expect(idea.title).toBe('Why Your Brain Sabotages You');
    expect(idea.niche).toBe('psychology');
    expect(idea.secondaryKeywords).toHaveLength(2);
  });

  it('should support optional id and createdAt fields', () => {
    const idea: VideoIdea = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: '8 Hours Deep Sleep Rain',
      hook: 'Close your eyes...',
      targetAudience: 'People with insomnia',
      whyItWorks: 'High RPM sleep niche',
      searchVolume: 'Rising Trend',
      primaryKeyword: 'deep sleep rain sounds',
      secondaryKeywords: ['rain for sleeping', '8 hour rain'],
      niche: 'ambient',
      createdAt: new Date('2026-01-15'),
    };

    expect(idea.id).toBeDefined();
    expect(idea.createdAt).toBeInstanceOf(Date);
  });

  it('should enforce Niche type as union', () => {
    const validNiches: Niche[] = ['psychology', 'ambient'];
    expect(validNiches).toHaveLength(2);
    expect(validNiches).toContain('psychology');
    expect(validNiches).toContain('ambient');
  });

  it('should enforce searchVolume as union', () => {
    const volumes: VideoIdea['searchVolume'][] = ['High', 'Medium', 'Rising Trend'];
    expect(volumes).toHaveLength(3);
  });
});
