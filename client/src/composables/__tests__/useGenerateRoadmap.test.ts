import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGenerateRoadmap } from '../useGenerateRoadmap';
import { useToolResultsStore } from '@/stores/toolResults';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  };
}

describe('useGenerateRoadmap', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and stores roadmap result', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: '## 30-Day Roadmap' }));

    const { generate } = useGenerateRoadmap();
    await generate('Brain Hacks', 'psychology');

    const toolStore = useToolResultsStore();
    expect(toolStore.results.roadmap).toBe('## 30-Day Roadmap');
    expect(toolStore.loading.roadmap).toBe(false);
  });

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: 'roadmap' }));

    const { generate } = useGenerateRoadmap();
    await generate('Ambient Vibes', 'ambient');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ videoTitle: 'Ambient Vibes', niche: 'ambient' });
  });

  it('skips empty videoTitle', async () => {
    const { generate } = useGenerateRoadmap();
    await generate('  ', 'psychology');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and sets error on API failure', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'SERVER_ERROR', message: 'fail', statusCode: 500 }, 500),
    );

    const { generate } = useGenerateRoadmap();
    await expect(generate('test', 'psychology')).rejects.toThrow();

    const toolStore = useToolResultsStore();
    expect(toolStore.loading.roadmap).toBe(false);
    expect(toolStore.errors.roadmap).toBe('fail');
  });
});
