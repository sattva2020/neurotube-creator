import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { VideoPlan } from '@neurotube/shared';

export const usePlanStore = defineStore('plan', () => {
  const plan = ref<VideoPlan | null>(null);
  const isLoading = ref(false);

  const id = computed(() => plan.value?.id);
  const markdown = computed(() => plan.value?.markdown ?? '');

  function setPlan(value: VideoPlan) {
    plan.value = value;
    console.debug('[PlanStore] Set plan', { id: value.id, title: value.title, length: value.markdown.length });
  }

  function clear() {
    plan.value = null;
    isLoading.value = false;
    console.debug('[PlanStore] Cleared plan');
  }

  return { plan, id, markdown, isLoading, setPlan, clear };
});
