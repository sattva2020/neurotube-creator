import { ref } from 'vue';
import { useApi, ApiRequestError } from './useApi';
import type { VideoPlan, Niche } from '@neurotube/shared';

export function usePlansHistory() {
  const { get, del } = useApi();

  const history = ref<VideoPlan[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll(niche?: Niche) {
    console.debug('[usePlansHistory] fetchAll() called', { niche: niche ?? 'all' });
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (niche) params.append('niche', niche);
      const query = params.toString() ? `?${params.toString()}` : '';
      history.value = await get<VideoPlan[]>(`/api/plans${query}`);
      console.debug('[usePlansHistory] fetchAll() completed', { count: history.value.length });
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Failed to load plans history';
      error.value = message;
      console.error('[usePlansHistory] fetchAll() error:', message);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchById(id: string): Promise<VideoPlan | null> {
    console.debug('[usePlansHistory] fetchById() called', { id });

    try {
      const plan = await get<VideoPlan>(`/api/plans/${id}`);
      console.debug('[usePlansHistory] fetchById() found', { id, title: plan.title });
      return plan;
    } catch (err) {
      if (err instanceof ApiRequestError && err.statusCode === 404) {
        console.debug('[usePlansHistory] fetchById() not found', { id });
        return null;
      }
      console.error('[usePlansHistory] fetchById() error:', err);
      throw err;
    }
  }

  async function remove(id: string) {
    console.debug('[usePlansHistory] remove() called', { id });

    try {
      await del<{ success: boolean }>(`/api/plans/${id}`);
      history.value = history.value.filter((p) => p.id !== id);
      console.debug('[usePlansHistory] remove() completed', { id });
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Failed to delete plan';
      error.value = message;
      console.error('[usePlansHistory] remove() error:', message);
      throw err;
    }
  }

  return { history, isLoading, error, fetchAll, fetchById, remove };
}
