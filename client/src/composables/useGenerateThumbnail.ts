import { useApi, ApiRequestError } from './useApi';
import { useToolResultsStore } from '@/stores/toolResults';

export function useGenerateThumbnail() {
  const { post } = useApi();
  const toolStore = useToolResultsStore();

  async function generate(prompt: string) {
    console.debug('[useGenerateThumbnail] generate() called', { prompt });

    if (!prompt.trim()) {
      console.debug('[useGenerateThumbnail] Empty prompt, skipping');
      return;
    }

    toolStore.setLoading('thumbnail', true);
    toolStore.setError('thumbnail', null);
    console.debug('[useGenerateThumbnail] Loading started');

    try {
      const result = await post<string | null>(
        '/api/thumbnails/generate',
        { prompt },
      );
      console.debug('[useGenerateThumbnail] Received result:', result ? 'base64 image' : 'null');
      toolStore.setResult('thumbnail', result);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGenerateThumbnail] API error:', error.statusCode, error.message);
        toolStore.setError('thumbnail', error.message);
      } else {
        console.error('[useGenerateThumbnail] Unexpected error:', error);
        toolStore.setError('thumbnail', 'Не удалось сгенерировать превью');
      }
      throw error;
    } finally {
      toolStore.setLoading('thumbnail', false);
      console.debug('[useGenerateThumbnail] Loading finished');
    }
  }

  return { generate };
}
