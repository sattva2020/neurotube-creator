import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGenerateNotebookLM } from '../useGenerateNotebookLM';
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

describe('useGenerateNotebookLM', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and stores markdown result', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: '## NotebookLM Document' }));

    const { generate } = useGenerateNotebookLM();
    await generate('Brain Hacks', '# Plan', 'psychology');

    const toolStore = useToolResultsStore();
    expect(toolStore.results.notebooklm).toBe('## NotebookLM Document');
    expect(toolStore.loading.notebooklm).toBe(false);
  });

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: 'doc' }));

    const { generate } = useGenerateNotebookLM();
    await generate('Title', 'Plan MD', 'ambient');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ videoTitle: 'Title', planMarkdown: 'Plan MD', niche: 'ambient' });
  });

  it('skips empty videoTitle', async () => {
    const { generate } = useGenerateNotebookLM();
    await generate('  ', 'plan', 'psychology');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and sets error on API failure', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'SERVER_ERROR', message: 'fail', statusCode: 500 }, 500),
    );

    const { generate } = useGenerateNotebookLM();
    await expect(generate('test', 'plan', 'psychology')).rejects.toThrow();

    const toolStore = useToolResultsStore();
    expect(toolStore.loading.notebooklm).toBe(false);
    expect(toolStore.errors.notebooklm).toBe('fail');
  });
});
