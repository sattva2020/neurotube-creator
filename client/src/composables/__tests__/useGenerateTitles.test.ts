import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGenerateTitles } from '../useGenerateTitles';
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

const mockTitles = ['Title A', 'Title B', 'Title C'];

describe('useGenerateTitles', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and stores titles array', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockTitles }));

    const { generate } = useGenerateTitles();
    await generate('Dopamine Detox');

    const toolStore = useToolResultsStore();
    expect(toolStore.results.titles).toEqual(mockTitles);
    expect(toolStore.loading.titles).toBe(false);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockTitles }));

    const { generate } = useGenerateTitles();
    await generate('Brain Hacks');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.titleIdea).toBe('Brain Hacks');
  });

  it('skips empty titleIdea', async () => {
    const { generate } = useGenerateTitles();
    await generate('  ');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and sets error on API failure', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'SERVER_ERROR', message: 'fail', statusCode: 500 }, 500),
    );

    const { generate } = useGenerateTitles();
    await expect(generate('test')).rejects.toThrow();

    const toolStore = useToolResultsStore();
    expect(toolStore.loading.titles).toBe(false);
    expect(toolStore.errors.titles).toBe('fail');
  });
});
