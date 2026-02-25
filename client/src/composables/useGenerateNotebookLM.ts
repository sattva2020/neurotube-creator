import { useApi, ApiRequestError } from './useApi';
import { useToolResultsStore } from '@/stores/toolResults';

export function useGenerateNotebookLM() {
  const { post } = useApi();
  const toolStore = useToolResultsStore();

  async function generate(videoTitle: string, planMarkdown: string, niche: string) {
    console.debug('[useGenerateNotebookLM] generate() called', { videoTitle, niche, planLength: planMarkdown.length });

    if (!videoTitle.trim()) {
      console.debug('[useGenerateNotebookLM] Empty videoTitle, skipping');
      return;
    }

    toolStore.setLoading('notebooklm', true);
    toolStore.setError('notebooklm', null);
    console.debug('[useGenerateNotebookLM] Loading started');

    try {
      const result = await post<string | null>(
        '/api/notebooklm/generate',
        { videoTitle, planMarkdown, niche },
      );
      console.debug('[useGenerateNotebookLM] Received result, length:', result?.length ?? 0);
      toolStore.setResult('notebooklm', result);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGenerateNotebookLM] API error:', error.statusCode, error.message);
        toolStore.setError('notebooklm', error.message);
      } else {
        console.error('[useGenerateNotebookLM] Unexpected error:', error);
        toolStore.setError('notebooklm', 'Не удалось сгенерировать документ NotebookLM');
      }
      throw error;
    } finally {
      toolStore.setLoading('notebooklm', false);
      console.debug('[useGenerateNotebookLM] Loading finished');
    }
  }

  return { generate };
}
