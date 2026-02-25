import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePlanStore = defineStore('plan', () => {
  const markdown = ref('');
  const isLoading = ref(false);

  function setPlan(md: string) {
    markdown.value = md;
    console.debug('[PlanStore] Set plan, length:', md.length, 'chars');
  }

  function clear() {
    markdown.value = '';
    isLoading.value = false;
    console.debug('[PlanStore] Cleared plan');
  }

  return { markdown, isLoading, setPlan, clear };
});
