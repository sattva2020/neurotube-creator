import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGenerateShorts } from '../useGenerateShorts';
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

describe('useGenerateShorts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and stores markdown result', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: '## 3 Shorts Ideas' }));

    const { generate } = useGenerateShorts();
    await generate('Brain Hacks', '# Plan');

    const toolStore = useToolResultsStore();
    expect(toolStore.results.shorts).toBe('## 3 Shorts Ideas');
    expect(toolStore.loading.shorts).toBe(false);
  });

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: 'shorts' }));

    const { generate } = useGenerateShorts();
    await generate('Title', 'Plan MD');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ videoTitle: 'Title', planMarkdown: 'Plan MD' });
  });

  it('skips empty videoTitle', async () => {
    const { generate } = useGenerateShorts();
    await generate('  ', 'plan');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and sets error on API failure', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'SERVER_ERROR', message: 'fail', statusCode: 500 }, 500),
    );

    const { generate } = useGenerateShorts();
    await expect(generate('test', 'plan')).rejects.toThrow();

    const toolStore = useToolResultsStore();
    expect(toolStore.loading.shorts).toBe(false);
    expect(toolStore.errors.shorts).toBe('fail');
  });
});
