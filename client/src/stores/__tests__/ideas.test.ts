import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useIdeasStore } from '../ideas';
import type { VideoIdea } from '@neurotube/shared';

const mockIdea: VideoIdea = {
  title: 'Test Idea',
  hook: 'A compelling hook',
  targetAudience: 'Psychology enthusiasts',
  whyItWorks: 'Because it is interesting',
  searchVolume: 'High',
  primaryKeyword: 'test keyword',
  secondaryKeywords: ['keyword1', 'keyword2'],
  niche: 'psychology',
};

describe('useIdeasStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts with empty state', () => {
    const store = useIdeasStore();
    expect(store.items).toEqual([]);
    expect(store.selected).toBeNull();
    expect(store.isLoading).toBe(false);
  });

  it('sets ideas and clears selection', () => {
    const store = useIdeasStore();
    store.selectIdea(mockIdea);
    store.setIdeas([mockIdea]);
    expect(store.items).toHaveLength(1);
    expect(store.selected).toBeNull();
  });

  it('selects an idea', () => {
    const store = useIdeasStore();
    store.setIdeas([mockIdea]);
    store.selectIdea(mockIdea);
    expect(store.selected).toEqual(mockIdea);
  });

  it('clears all state', () => {
    const store = useIdeasStore();
    store.setIdeas([mockIdea]);
    store.selectIdea(mockIdea);
    store.isLoading = true;
    store.clear();
    expect(store.items).toEqual([]);
    expect(store.selected).toBeNull();
    expect(store.isLoading).toBe(false);
  });
});
