import type { ChannelBranding } from '@neurotube/shared';
import { useApi, ApiRequestError } from './useApi';
import { useToolResultsStore } from '@/stores/toolResults';

export function useGenerateBranding() {
  const { post } = useApi();
  const toolStore = useToolResultsStore();

  async function generate(videoTitle: string, niche: string) {
    console.debug('[useGenerateBranding] generate() called', { videoTitle, niche });

    if (!videoTitle.trim()) {
      console.debug('[useGenerateBranding] Empty videoTitle, skipping');
      return;
    }

    toolStore.setLoading('branding', true);
    toolStore.setError('branding', null);
    console.debug('[useGenerateBranding] Loading started');

    try {
      const result = await post<ChannelBranding | null>(
        '/api/branding/generate',
        { videoTitle, niche },
      );
      console.debug('[useGenerateBranding] Received result:', result ? 'branding data' : 'null');
      toolStore.setResult('branding', result);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGenerateBranding] API error:', error.statusCode, error.message);
        toolStore.setError('branding', error.message);
      } else {
        console.error('[useGenerateBranding] Unexpected error:', error);
        toolStore.setError('branding', 'Не удалось сгенерировать брендинг');
      }
      throw error;
    } finally {
      toolStore.setLoading('branding', false);
      console.debug('[useGenerateBranding] Loading finished');
    }
  }

  return { generate };
}
