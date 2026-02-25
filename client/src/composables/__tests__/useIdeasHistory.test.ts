import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIdeasHistory } from '../useIdeasHistory';
import type { VideoIdea } from '@neurotube/shared';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockIdea: VideoIdea = {
  id: 'idea-1',
  title: 'Brain Hacks',
  hook: 'Did you know?',
  targetAudience: 'Students',
  whyItWorks: 'Curiosity',
  searchVolume: 'High',
  primaryKeyword: 'brain',
  secondaryKeywords: ['memory'],
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

describe('useIdeasHistory', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetchAll loads ideas into history', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: [mockIdea] }));

    const { history, isLoading, fetchAll } = useIdeasHistory();
    await fetchAll();

    expect(history.value).toEqual([mockIdea]);
    expect(isLoading.value).toBe(false);
  });

  it('fetchAll filters by niche', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

    const { fetchAll } = useIdeasHistory();
    await fetchAll('ambient');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/ideas?niche=ambient'),
      expect.any(Object),
    );
  });

  it('fetchAll sets error on failure', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'ERR', message: 'fail' }, 500));

    const { error, fetchAll } = useIdeasHistory();
    await fetchAll();

    expect(error.value).toBeTruthy();
  });

  it('fetchById returns idea when found', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockIdea }));

    const { fetchById } = useIdeasHistory();
    const result = await fetchById('idea-1');

    expect(result).toEqual(mockIdea);
  });

  it('fetchById returns null when not found', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'Not found', message: 'Not found' }, 404));

    const { fetchById } = useIdeasHistory();
    const result = await fetchById('nonexistent');

    expect(result).toBeNull();
  });

  it('remove deletes and updates history', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ data: [mockIdea] }))
      .mockResolvedValueOnce(jsonResponse({ data: { success: true } }));

    const { history, remove, fetchAll } = useIdeasHistory();
    await fetchAll();
    expect(history.value).toHaveLength(1);

    await remove('idea-1');
    expect(history.value).toHaveLength(0);
  });
});
