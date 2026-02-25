import { useApi, ApiRequestError } from './useApi';
import { useToolResultsStore } from '@/stores/toolResults';

export function useGenerateSuno() {
  const { post } = useApi();
  const toolStore = useToolResultsStore();

  async function generate(videoTitle: string, planMarkdown: string) {
    console.debug('[useGenerateSuno] generate() called', { videoTitle, planLength: planMarkdown.length });

    if (!videoTitle.trim()) {
      console.debug('[useGenerateSuno] Empty videoTitle, skipping');
      return;
    }

    toolStore.setLoading('suno', true);
    toolStore.setError('suno', null);
    console.debug('[useGenerateSuno] Loading started');

    try {
      const result = await post<string | null>(
        '/api/suno/generate',
        { videoTitle, planMarkdown },
      );
      console.debug('[useGenerateSuno] Received result, length:', result?.length ?? 0);
      toolStore.setResult('suno', result);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGenerateSuno] API error:', error.statusCode, error.message);
        toolStore.setError('suno', error.message);
      } else {
        console.error('[useGenerateSuno] Unexpected error:', error);
        toolStore.setError('suno', 'Не удалось сгенерировать промпт для Suno');
      }
      throw error;
    } finally {
      toolStore.setLoading('suno', false);
      console.debug('[useGenerateSuno] Loading finished');
    }
  }

  return { generate };
}
