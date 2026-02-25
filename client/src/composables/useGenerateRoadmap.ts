import { useApi, ApiRequestError } from './useApi';
import { useToolResultsStore } from '@/stores/toolResults';

export function useGenerateRoadmap() {
  const { post } = useApi();
  const toolStore = useToolResultsStore();

  async function generate(videoTitle: string, niche: string) {
    console.debug('[useGenerateRoadmap] generate() called', { videoTitle, niche });

    if (!videoTitle.trim()) {
      console.debug('[useGenerateRoadmap] Empty videoTitle, skipping');
      return;
    }

    toolStore.setLoading('roadmap', true);
    toolStore.setError('roadmap', null);
    console.debug('[useGenerateRoadmap] Loading started');

    try {
      const result = await post<string | null>(
        '/api/roadmap/generate',
        { videoTitle, niche },
      );
      console.debug('[useGenerateRoadmap] Received result, length:', result?.length ?? 0);
      toolStore.setResult('roadmap', result);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGenerateRoadmap] API error:', error.statusCode, error.message);
        toolStore.setError('roadmap', error.message);
      } else {
        console.error('[useGenerateRoadmap] Unexpected error:', error);
        toolStore.setError('roadmap', 'Не удалось сгенерировать контент-план');
      }
      throw error;
    } finally {
      toolStore.setLoading('roadmap', false);
      console.debug('[useGenerateRoadmap] Loading finished');
    }
  }

  return { generate };
}
