import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { useNicheStore } from '../niche';

describe('useNicheStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('defaults to psychology niche', () => {
    const store = useNicheStore();
    expect(store.active).toBe('psychology');
  });

  it('toggles from psychology to ambient', () => {
    const store = useNicheStore();
    store.toggle();
    expect(store.active).toBe('ambient');
  });

  it('toggles back from ambient to psychology', () => {
    const store = useNicheStore();
    store.toggle();
    store.toggle();
    expect(store.active).toBe('psychology');
  });

  it('sets niche directly', () => {
    const store = useNicheStore();
    store.set('ambient');
    expect(store.active).toBe('ambient');
  });

  it('persists niche to localStorage on change', async () => {
    const store = useNicheStore();
    store.set('ambient');
    await nextTick();
    expect(localStorage.getItem('neurotube-niche')).toBe('ambient');
  });

  it('loads niche from localStorage on init', () => {
    localStorage.setItem('neurotube-niche', 'ambient');
    setActivePinia(createPinia());
    const store = useNicheStore();
    expect(store.active).toBe('ambient');
  });

  it('defaults to psychology when localStorage has invalid value', () => {
    localStorage.setItem('neurotube-niche', 'invalid');
    setActivePinia(createPinia());
    const store = useNicheStore();
    expect(store.active).toBe('psychology');
  });
});
