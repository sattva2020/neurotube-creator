import { useApi, ApiRequestError } from './useApi';
import { useIdeasStore } from '@/stores/ideas';
import { useNicheStore } from '@/stores/niche';

export function useGenerateIdeas() {
  const { post } = useApi();
  const ideasStore = useIdeasStore();
  const nicheStore = useNicheStore();

  async function generate(topic: string) {
    const niche = nicheStore.active;
    console.debug('[useGenerateIdeas] generate() called', { topic, niche });

    if (!topic.trim()) {
      console.debug('[useGenerateIdeas] Empty topic, skipping');
      return;
    }

    ideasStore.isLoading = true;
    ideasStore.clear();
    console.debug('[useGenerateIdeas] Loading started, store cleared');

    try {
      const ideas = await post<import('@neurotube/shared').VideoIdea[]>(
        '/api/ideas/generate',
        { topic, niche },
      );
      console.debug('[useGenerateIdeas] Received ideas:', ideas.length, 'items');
      ideasStore.setIdeas(ideas);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error('[useGenerateIdeas] API error:', error.statusCode, error.message);
      } else {
        console.error('[useGenerateIdeas] Unexpected error:', error);
      }
      throw error;
    } finally {
      ideasStore.isLoading = false;
      console.debug('[useGenerateIdeas] Loading finished');
    }
  }

  return { generate };
}
