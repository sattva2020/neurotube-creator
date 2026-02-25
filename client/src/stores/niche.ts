import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Niche } from '@neurotube/shared';

export const useNicheStore = defineStore('niche', () => {
  const active = ref<Niche>('psychology');

  function toggle() {
    const prev = active.value;
    active.value = active.value === 'psychology' ? 'ambient' : 'psychology';
    console.debug('[NicheStore] Toggled niche:', prev, '→', active.value);
  }

  function set(niche: Niche) {
    console.debug('[NicheStore] Set niche:', niche);
    active.value = niche;
  }

  return { active, toggle, set };
});
