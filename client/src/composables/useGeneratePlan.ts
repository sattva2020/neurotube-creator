import { useApi, ApiRequestError } from './useApi';
import { usePlanStore } from '@/stores/plan';
import { useIdeasStore } from '@/stores/ideas';
import type { VideoPlan } from '@neurotube/shared';

export function useGeneratePlan() {
  const { post } = useApi();
  const planStore = usePlanStore();
  const ideasStore = useIdeasStore();

  async function generate() {
    const idea = ideasStore.selected;
    if (!idea) {
      console.debug('[useGeneratePlan] No selected idea, skipping');
      return;
    }

    console.debug('[useGeneratePlan] generate() called', {
      title: idea.title,
      niche: idea.niche,
    });

    planStore.isLoading = true;
    planStore.clear();
    console.debug('[useGeneratePlan] Loading started, store cleared');

    try {
      const plan = await post<VideoPlan>(
        '/api/plans/generate',
        { title: idea.title, hook: idea.hook, niche: idea.niche },
      );
      console.debug('[useGeneratePlan] Received plan', { id: plan.id, title: plan.title, length: plan.markdown.length });
      planStore.setPlan(plan);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGeneratePlan] API error:', error.statusCode, error.message);
      } else {
        console.error('[useGeneratePlan] Unexpected error:', error);
      }
      throw error;
    } finally {
      planStore.isLoading = false;
      console.debug('[useGeneratePlan] Loading finished');
    }
  }

  return { generate };
}
