import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Niche } from '@neurotube/shared';

const STORAGE_KEY = 'neurotube-niche';

function loadFromStorage(): Niche {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'psychology' || saved === 'ambient') {
      console.debug('[NicheStore] Loaded from localStorage:', saved);
      return saved;
    }
  } catch {
    console.debug('[NicheStore] localStorage read failed, using default');
  }
  return 'psychology';
}

export const useNicheStore = defineStore('niche', () => {
  const active = ref<Niche>(loadFromStorage());

  watch(active, (niche) => {
    try {
      localStorage.setItem(STORAGE_KEY, niche);
      console.debug('[NicheStore] Saved to localStorage:', niche);
    } catch {
      console.debug('[NicheStore] localStorage write failed');
    }
  });

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
