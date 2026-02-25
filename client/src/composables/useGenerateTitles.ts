import { useApi, ApiRequestError } from './useApi';
import { useToolResultsStore } from '@/stores/toolResults';

export function useGenerateTitles() {
  const { post } = useApi();
  const toolStore = useToolResultsStore();

  async function generate(titleIdea: string) {
    console.debug('[useGenerateTitles] generate() called', { titleIdea });

    if (!titleIdea.trim()) {
      console.debug('[useGenerateTitles] Empty titleIdea, skipping');
      return;
    }

    toolStore.setLoading('titles', true);
    toolStore.setError('titles', null);
    console.debug('[useGenerateTitles] Loading started');

    try {
      const result = await post<string[]>(
        '/api/titles/generate',
        { titleIdea },
      );
      console.debug('[useGenerateTitles] Received titles:', result?.length ?? 0, 'items');
      toolStore.setResult('titles', result);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGenerateTitles] API error:', error.statusCode, error.message);
        toolStore.setError('titles', error.message);
      } else {
        console.error('[useGenerateTitles] Unexpected error:', error);
        toolStore.setError('titles', 'Не удалось сгенерировать заголовки');
      }
      throw error;
    } finally {
      toolStore.setLoading('titles', false);
      console.debug('[useGenerateTitles] Loading finished');
    }
  }

  return { generate };
}
