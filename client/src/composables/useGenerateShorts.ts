import { useApi, ApiRequestError } from './useApi';
import { useToolResultsStore } from '@/stores/toolResults';

export function useGenerateShorts() {
  const { post } = useApi();
  const toolStore = useToolResultsStore();

  async function generate(videoTitle: string, planMarkdown: string) {
    console.debug('[useGenerateShorts] generate() called', { videoTitle, planLength: planMarkdown.length });

    if (!videoTitle.trim()) {
      console.debug('[useGenerateShorts] Empty videoTitle, skipping');
      return;
    }

    toolStore.setLoading('shorts', true);
    toolStore.setError('shorts', null);
    console.debug('[useGenerateShorts] Loading started');

    try {
      const result = await post<string | null>(
        '/api/shorts/generate',
        { videoTitle, planMarkdown },
      );
      console.debug('[useGenerateShorts] Received result, length:', result?.length ?? 0);
      toolStore.setResult('shorts', result);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGenerateShorts] API error:', error.statusCode, error.message);
        toolStore.setError('shorts', error.message);
      } else {
        console.error('[useGenerateShorts] Unexpected error:', error);
        toolStore.setError('shorts', 'Не удалось сгенерировать идеи для Shorts');
      }
      throw error;
    } finally {
      toolStore.setLoading('shorts', false);
      console.debug('[useGenerateShorts] Loading finished');
    }
  }

  return { generate };
}
