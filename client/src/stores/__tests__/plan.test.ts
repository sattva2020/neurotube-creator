import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlanStore } from '../plan';

describe('usePlanStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts with empty state', () => {
    const store = usePlanStore();
    expect(store.markdown).toBe('');
    expect(store.isLoading).toBe(false);
  });

  it('sets plan markdown', () => {
    const store = usePlanStore();
    store.setPlan('# My Plan\n\nContent here');
    expect(store.markdown).toBe('# My Plan\n\nContent here');
  });

  it('clears plan state', () => {
    const store = usePlanStore();
    store.setPlan('some content');
    store.isLoading = true;
    store.clear();
    expect(store.markdown).toBe('');
    expect(store.isLoading).toBe(false);
  });
});
