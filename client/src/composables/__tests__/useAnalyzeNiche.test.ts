import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAnalyzeNiche } from '../useAnalyzeNiche';
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

describe('useAnalyzeNiche', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and stores analysis result', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: '## Niche Analysis' }));

    const { generate } = useAnalyzeNiche();
    await generate('Brain Hacks', 'psychology');

    const toolStore = useToolResultsStore();
    expect(toolStore.results.nicheAnalysis).toBe('## Niche Analysis');
    expect(toolStore.loading.nicheAnalysis).toBe(false);
  });

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: 'analysis' }));

    const { generate } = useAnalyzeNiche();
    await generate('Ambient Vibes', 'ambient');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ videoTitle: 'Ambient Vibes', niche: 'ambient' });
  });

  it('skips empty videoTitle', async () => {
    const { generate } = useAnalyzeNiche();
    await generate('  ', 'psychology');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and sets error on API failure', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'SERVER_ERROR', message: 'fail', statusCode: 500 }, 500),
    );

    const { generate } = useAnalyzeNiche();
    await expect(generate('test', 'psychology')).rejects.toThrow();

    const toolStore = useToolResultsStore();
    expect(toolStore.loading.nicheAnalysis).toBe(false);
    expect(toolStore.errors.nicheAnalysis).toBe('fail');
  });
});
