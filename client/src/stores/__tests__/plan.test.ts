import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlanStore } from '../plan';

const mockPlan = {
  id: 'plan-1',
  title: 'Brain Hacks 101',
  markdown: '# My Plan\n\nContent here',
  niche: 'psychology' as const,
  createdAt: '2026-01-01',
};

describe('usePlanStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts with empty state', () => {
    const store = usePlanStore();
    expect(store.plan).toBeNull();
    expect(store.markdown).toBe('');
    expect(store.id).toBeUndefined();
    expect(store.isLoading).toBe(false);
  });

  it('sets full VideoPlan entity', () => {
    const store = usePlanStore();
    store.setPlan(mockPlan);
    expect(store.plan).toEqual(mockPlan);
    expect(store.markdown).toBe('# My Plan\n\nContent here');
    expect(store.id).toBe('plan-1');
  });

  it('clears plan state', () => {
    const store = usePlanStore();
    store.setPlan(mockPlan);
    store.isLoading = true;
    store.clear();
    expect(store.plan).toBeNull();
    expect(store.markdown).toBe('');
    expect(store.id).toBeUndefined();
    expect(store.isLoading).toBe(false);
  });
});
