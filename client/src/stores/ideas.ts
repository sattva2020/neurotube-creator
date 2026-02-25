import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { VideoIdea } from '@neurotube/shared';

export const useIdeasStore = defineStore('ideas', () => {
  const items = ref<VideoIdea[]>([]);
  const selected = ref<VideoIdea | null>(null);
  const isLoading = ref(false);

  function setIdeas(ideas: VideoIdea[]) {
    items.value = ideas;
    selected.value = null;
    console.debug('[IdeasStore] Set ideas:', ideas.length, 'items');
  }

  function selectIdea(idea: VideoIdea) {
    selected.value = idea;
    console.debug('[IdeasStore] Selected idea:', idea.title);
  }

  function clear() {
    items.value = [];
    selected.value = null;
    isLoading.value = false;
    console.debug('[IdeasStore] Cleared all ideas');
  }

  return { items, selected, isLoading, setIdeas, selectIdea, clear };
});
