import { useApi, ApiRequestError } from './useApi';
import { useToolResultsStore } from '@/stores/toolResults';

export function useGenerateDescription() {
  const { post } = useApi();
  const toolStore = useToolResultsStore();

  async function generate(videoTitle: string, planMarkdown: string, niche: string) {
    console.debug('[useGenerateDescription] generate() called', { videoTitle, niche, planLength: planMarkdown.length });

    if (!videoTitle.trim()) {
      console.debug('[useGenerateDescription] Empty videoTitle, skipping');
      return;
    }

    toolStore.setLoading('description', true);
    toolStore.setError('description', null);
    console.debug('[useGenerateDescription] Loading started');

    try {
      const result = await post<string | null>(
        '/api/descriptions/generate',
        { videoTitle, planMarkdown, niche },
      );
      console.debug('[useGenerateDescription] Received result, length:', result?.length ?? 0);
      toolStore.setResult('description', result);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGenerateDescription] API error:', error.statusCode, error.message);
        toolStore.setError('description', error.message);
      } else {
        console.error('[useGenerateDescription] Unexpected error:', error);
        toolStore.setError('description', 'Не удалось сгенерировать описание');
      }
      throw error;
    } finally {
      toolStore.setLoading('description', false);
      console.debug('[useGenerateDescription] Loading finished');
    }
  }

  return { generate };
}
