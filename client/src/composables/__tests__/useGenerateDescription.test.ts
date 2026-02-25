import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGenerateDescription } from '../useGenerateDescription';
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

describe('useGenerateDescription', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and stores markdown result', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: '## SEO Description' }));

    const { generate } = useGenerateDescription();
    await generate('Brain Hacks', '# Plan markdown', 'psychology');

    const toolStore = useToolResultsStore();
    expect(toolStore.results.description).toBe('## SEO Description');
    expect(toolStore.loading.description).toBe(false);
  });

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: 'desc' }));

    const { generate } = useGenerateDescription();
    await generate('Title', 'Plan MD', 'ambient');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ videoTitle: 'Title', planMarkdown: 'Plan MD', niche: 'ambient' });
  });

  it('skips empty videoTitle', async () => {
    const { generate } = useGenerateDescription();
    await generate('  ', 'plan', 'psychology');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and sets error on API failure', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'SERVER_ERROR', message: 'fail', statusCode: 500 }, 500),
    );

    const { generate } = useGenerateDescription();
    await expect(generate('test', 'plan', 'psychology')).rejects.toThrow();

    const toolStore = useToolResultsStore();
    expect(toolStore.loading.description).toBe(false);
    expect(toolStore.errors.description).toBe('fail');
  });
});
