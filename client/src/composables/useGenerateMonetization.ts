import { useApi, ApiRequestError } from './useApi';
import { useToolResultsStore } from '@/stores/toolResults';

export function useGenerateMonetization() {
  const { post } = useApi();
  const toolStore = useToolResultsStore();

  async function generate(videoTitle: string, niche: string) {
    console.debug('[useGenerateMonetization] generate() called', { videoTitle, niche });

    if (!videoTitle.trim()) {
      console.debug('[useGenerateMonetization] Empty videoTitle, skipping');
      return;
    }

    toolStore.setLoading('monetization', true);
    toolStore.setError('monetization', null);
    console.debug('[useGenerateMonetization] Loading started');

    try {
      const result = await post<string | null>(
        '/api/monetization/generate',
        { videoTitle, niche },
      );
      console.debug('[useGenerateMonetization] Received result, length:', result?.length ?? 0);
      toolStore.setResult('monetization', result);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGenerateMonetization] API error:', error.statusCode, error.message);
        toolStore.setError('monetization', error.message);
      } else {
        console.error('[useGenerateMonetization] Unexpected error:', error);
        toolStore.setError('monetization', 'Не удалось сгенерировать монетизацию');
      }
      throw error;
    } finally {
      toolStore.setLoading('monetization', false);
      console.debug('[useGenerateMonetization] Loading finished');
    }
  }

  return { generate };
}
