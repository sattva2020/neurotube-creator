import { ref } from 'vue';
import { useApi, ApiRequestError } from './useApi';
import type { VideoIdea, Niche } from '@neurotube/shared';

export function useIdeasHistory() {
  const { get, del } = useApi();

  const history = ref<VideoIdea[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll(niche?: Niche) {
    console.debug('[useIdeasHistory] fetchAll() called', { niche: niche ?? 'all' });
    isLoading.value = true;
    error.value = null;

    try {
      const query = niche ? `?niche=${niche}` : '';
      history.value = await get<VideoIdea[]>(`/api/ideas${query}`);
      console.debug('[useIdeasHistory] fetchAll() completed', { count: history.value.length });
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Failed to load ideas history';
      error.value = message;
      console.error('[useIdeasHistory] fetchAll() error:', message);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchById(id: string): Promise<VideoIdea | null> {
    console.debug('[useIdeasHistory] fetchById() called', { id });

    try {
      const idea = await get<VideoIdea>(`/api/ideas/${id}`);
      console.debug('[useIdeasHistory] fetchById() found', { id, title: idea.title });
      return idea;
    } catch (err) {
      if (err instanceof ApiRequestError && err.statusCode === 404) {
        console.debug('[useIdeasHistory] fetchById() not found', { id });
        return null;
      }
      console.error('[useIdeasHistory] fetchById() error:', err);
      throw err;
    }
  }

  async function remove(id: string) {
    console.debug('[useIdeasHistory] remove() called', { id });

    try {
      await del<{ success: boolean }>(`/api/ideas/${id}`);
      history.value = history.value.filter((i) => i.id !== id);
      console.debug('[useIdeasHistory] remove() completed', { id });
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Failed to delete idea';
      error.value = message;
      console.error('[useIdeasHistory] remove() error:', message);
      throw err;
    }
  }

  return { history, isLoading, error, fetchAll, fetchById, remove };
}
