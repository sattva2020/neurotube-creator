import { useApi, ApiRequestError } from './useApi';
import { useToolResultsStore } from '@/stores/toolResults';

export function useAnalyzeNiche() {
  const { post } = useApi();
  const toolStore = useToolResultsStore();

  async function generate(videoTitle: string, niche: string) {
    console.debug('[useAnalyzeNiche] generate() called', { videoTitle, niche });

    if (!videoTitle.trim()) {
      console.debug('[useAnalyzeNiche] Empty videoTitle, skipping');
      return;
    }

    toolStore.setLoading('nicheAnalysis', true);
    toolStore.setError('nicheAnalysis', null);
    console.debug('[useAnalyzeNiche] Loading started');

    try {
      const result = await post<string | null>(
        '/api/analysis/niche',
        { videoTitle, niche },
      );
      console.debug('[useAnalyzeNiche] Received result, length:', result?.length ?? 0);
      toolStore.setResult('nicheAnalysis', result);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useAnalyzeNiche] API error:', error.statusCode, error.message);
        toolStore.setError('nicheAnalysis', error.message);
      } else {
        console.error('[useAnalyzeNiche] Unexpected error:', error);
        toolStore.setError('nicheAnalysis', 'Не удалось выполнить анализ ниши');
      }
      throw error;
    } finally {
      toolStore.setLoading('nicheAnalysis', false);
      console.debug('[useAnalyzeNiche] Loading finished');
    }
  }

  return { generate };
}
