import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGenerateThumbnail } from '../useGenerateThumbnail';
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

describe('useGenerateThumbnail', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and stores base64 result', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: 'iVBOR...base64data' }));

    const { generate } = useGenerateThumbnail();
    await generate('A brain on fire');

    const toolStore = useToolResultsStore();
    expect(toolStore.results.thumbnail).toBe('iVBOR...base64data');
    expect(toolStore.loading.thumbnail).toBe(false);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: 'img' }));

    const { generate } = useGenerateThumbnail();
    await generate('Mountain landscape');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.prompt).toBe('Mountain landscape');
  });

  it('skips empty prompt', async () => {
    const { generate } = useGenerateThumbnail();
    await generate('  ');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and sets error on API failure', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'SERVER_ERROR', message: 'fail', statusCode: 500 }, 500),
    );

    const { generate } = useGenerateThumbnail();
    await expect(generate('test')).rejects.toThrow();

    const toolStore = useToolResultsStore();
    expect(toolStore.loading.thumbnail).toBe(false);
    expect(toolStore.errors.thumbnail).toBe('fail');
  });
});
