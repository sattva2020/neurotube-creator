import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlansHistory } from '../usePlansHistory';
import type { VideoPlan } from '@neurotube/shared';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockPlan: VideoPlan = {
  id: 'plan-1',
  title: 'Brain Hacks Plan',
  markdown: '# Plan\n\nContent...',
  niche: 'psychology',
  createdAt: '2026-01-01',
};

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  };
}

describe('usePlansHistory', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    setActivePinia(createPinia());
  });

  it('fetchAll loads plans into history', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: [mockPlan] }));

    const { history, isLoading, fetchAll } = usePlansHistory();
    await fetchAll();

    expect(history.value).toEqual([mockPlan]);
    expect(isLoading.value).toBe(false);
  });

  it('fetchAll filters by niche', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

    const { fetchAll } = usePlansHistory();
    await fetchAll('ambient');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/plans?niche=ambient'),
      expect.any(Object),
    );
  });

  it('fetchAll sets error on failure', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'ERR', message: 'fail' }, 500));

    const { error, fetchAll } = usePlansHistory();
    await fetchAll();

    expect(error.value).toBeTruthy();
  });

  it('fetchById returns plan when found', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockPlan }));

    const { fetchById } = usePlansHistory();
    const result = await fetchById('plan-1');

    expect(result).toEqual(mockPlan);
  });

  it('fetchById returns null when not found', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'Not found', message: 'Not found' }, 404));

    const { fetchById } = usePlansHistory();
    const result = await fetchById('nonexistent');

    expect(result).toBeNull();
  });

  it('remove deletes and updates history', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ data: [mockPlan] }))
      .mockResolvedValueOnce(jsonResponse({ data: { success: true } }));

    const { history, remove, fetchAll } = usePlansHistory();
    await fetchAll();
    expect(history.value).toHaveLength(1);

    await remove('plan-1');
    expect(history.value).toHaveLength(0);
  });
});
