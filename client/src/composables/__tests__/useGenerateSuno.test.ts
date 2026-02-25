import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGenerateSuno } from '../useGenerateSuno';
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

describe('useGenerateSuno', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and stores suno prompt result', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: '## Suno Prompt' }));

    const { generate } = useGenerateSuno();
    await generate('Brain Hacks', '# Plan');

    const toolStore = useToolResultsStore();
    expect(toolStore.results.suno).toBe('## Suno Prompt');
    expect(toolStore.loading.suno).toBe(false);
  });

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: 'prompt' }));

    const { generate } = useGenerateSuno();
    await generate('Title', 'Plan MD');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ videoTitle: 'Title', planMarkdown: 'Plan MD' });
  });

  it('skips empty videoTitle', async () => {
    const { generate } = useGenerateSuno();
    await generate('  ', 'plan');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and sets error on API failure', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'SERVER_ERROR', message: 'fail', statusCode: 500 }, 500),
    );

    const { generate } = useGenerateSuno();
    await expect(generate('test', 'plan')).rejects.toThrow();

    const toolStore = useToolResultsStore();
    expect(toolStore.loading.suno).toBe(false);
    expect(toolStore.errors.suno).toBe('fail');
  });
});
