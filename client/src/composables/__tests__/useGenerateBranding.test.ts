import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGenerateBranding } from '../useGenerateBranding';
import { useToolResultsStore } from '@/stores/toolResults';
import type { ChannelBranding } from '@neurotube/shared';

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

const mockBranding: ChannelBranding = {
  channelNames: ['NeuroVibe', 'BrainWave'],
  seoDescription: 'A channel about neuroscience',
  avatarPrompt: 'Minimalist brain icon',
  bannerPrompt: 'Neural network abstract art',
};

describe('useGenerateBranding', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('calls API and stores branding data', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockBranding }));

    const { generate } = useGenerateBranding();
    await generate('Neuroscience Tips', 'psychology');

    const toolStore = useToolResultsStore();
    expect(toolStore.results.branding).toEqual(mockBranding);
    expect(toolStore.loading.branding).toBe(false);
  });

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockBranding }));

    const { generate } = useGenerateBranding();
    await generate('Ambient Vibes', 'ambient');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ videoTitle: 'Ambient Vibes', niche: 'ambient' });
  });

  it('skips empty videoTitle', async () => {
    const { generate } = useGenerateBranding();
    await generate('  ', 'psychology');

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws and sets error on API failure', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'SERVER_ERROR', message: 'fail', statusCode: 500 }, 500),
    );

    const { generate } = useGenerateBranding();
    await expect(generate('test', 'psychology')).rejects.toThrow();

    const toolStore = useToolResultsStore();
    expect(toolStore.loading.branding).toBe(false);
    expect(toolStore.errors.branding).toBe('fail');
  });
});
