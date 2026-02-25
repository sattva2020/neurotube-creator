import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGenerateIdeas } from '../useGenerateIdeas';
import { useIdeasStore } from '@/stores/ideas';
import { useNicheStore } from '@/stores/niche';
import type { VideoIdea } from '@neurotube/shared';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockIdeas: VideoIdea[] = [
  {
    title: 'Test Idea',
    hook: 'A compelling hook',
    targetAudience: 'Psychology enthusiasts',
    whyItWorks: 'Interesting topic',
    searchVolume: 'High',
    primaryKeyword: 'test',
    secondaryKeywords: ['keyword1'],
    niche: 'psychology',
  },
];

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  };
}

describe('useGenerateIdeas', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and updates ideasStore', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockIdeas }));

    const { generate } = useGenerateIdeas();
    await generate('Dopamine Detox');

    const ideasStore = useIdeasStore();
    expect(ideasStore.items).toEqual(mockIdeas);
    expect(ideasStore.isLoading).toBe(false);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('uses current niche from nicheStore', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockIdeas }));

    const nicheStore = useNicheStore();
    nicheStore.set('ambient');

    const { generate } = useGenerateIdeas();
    await generate('Rain sounds');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.niche).toBe('ambient');
  });

  it('skips empty topic', async () => {
    const { generate } = useGenerateIdeas();
    await generate('  ');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and resets loading on API error', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'SERVER_ERROR', message: 'fail', statusCode: 500 }, 500),
    );

    const { generate } = useGenerateIdeas();
    await expect(generate('test')).rejects.toThrow();

    const ideasStore = useIdeasStore();
    expect(ideasStore.isLoading).toBe(false);
    expect(ideasStore.items).toEqual([]);
  });
});
