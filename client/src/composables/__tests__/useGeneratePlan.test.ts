import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGeneratePlan } from '../useGeneratePlan';
import { usePlanStore } from '@/stores/plan';
import { useIdeasStore } from '@/stores/ideas';
import type { VideoIdea } from '@neurotube/shared';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockIdea: VideoIdea = {
  title: 'Test Idea',
  hook: 'A compelling hook',
  targetAudience: 'Psychology enthusiasts',
  whyItWorks: 'Interesting',
  searchVolume: 'High',
  primaryKeyword: 'test',
  secondaryKeywords: ['kw1'],
  niche: 'psychology',
};

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  };
}

describe('useGeneratePlan', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and updates planStore', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: '# Plan\nContent here' }));

    const ideasStore = useIdeasStore();
    ideasStore.selectIdea(mockIdea);

    const { generate } = useGeneratePlan();
    await generate();

    const planStore = usePlanStore();
    expect(planStore.markdown).toBe('# Plan\nContent here');
    expect(planStore.isLoading).toBe(false);
  });

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: '# Plan' }));

    const ideasStore = useIdeasStore();
    ideasStore.selectIdea(mockIdea);

    const { generate } = useGeneratePlan();
    await generate();

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      title: 'Test Idea',
      hook: 'A compelling hook',
      niche: 'psychology',
    });
  });

  it('skips when no idea selected', async () => {
    const { generate } = useGeneratePlan();
    await generate();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and resets loading on error', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'ERR', message: 'fail', statusCode: 500 }, 500),
    );

    const ideasStore = useIdeasStore();
    ideasStore.selectIdea(mockIdea);

    const { generate } = useGeneratePlan();
    await expect(generate()).rejects.toThrow();

    const planStore = usePlanStore();
    expect(planStore.isLoading).toBe(false);
  });
});
