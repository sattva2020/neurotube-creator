import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PlanPage from '../PlanPage.vue';
import { usePlanStore } from '@/stores/plan';
import { useIdeasStore } from '@/stores/ideas';
import type { VideoIdea } from '@neurotube/shared';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}));

vi.mock('quasar', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(undefined),
}));

const quasarStubs = {
  'q-page': { template: '<div><slot /></div>' },
  'q-btn': { template: '<button class="q-btn" @click="$emit(\'click\', $event)">{{ label }}<slot /></button>', props: ['label', 'flat', 'round', 'icon', 'color', 'noCaps', 'loading', 'disable'], emits: ['click'] },
  'q-banner': { template: '<div class="q-banner"><slot /><slot name="avatar" /><slot name="action" /></div>' },
  'q-spinner-dots': { template: '<div class="spinner" />' },
  'q-icon': { template: '<i />' },
  'q-tooltip': { template: '<span />' },
};

function mountPlanPage() {
  return shallowMount(PlanPage, {
    global: {
      stubs: quasarStubs,
    },
  });
}

const mockIdea: VideoIdea = {
  title: 'Test Video Idea',
  hook: 'A compelling hook',
  targetAudience: 'Audience',
  whyItWorks: 'Works',
  searchVolume: 'High',
  primaryKeyword: 'kw',
  secondaryKeywords: [],
  niche: 'psychology',
};

describe('PlanPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
    mockPush.mockReset();
  });

  it('shows warning when no idea selected', () => {
    const wrapper = mountPlanPage();
    expect(wrapper.text()).toContain('Идея не выбрана');
  });

  it('shows loading spinner when generating', () => {
    const ideasStore = useIdeasStore();
    ideasStore.selectIdea(mockIdea);
    const planStore = usePlanStore();
    planStore.isLoading = true;

    const wrapper = mountPlanPage();
    expect(wrapper.find('.spinner').exists()).toBe(true);
    expect(wrapper.text()).toContain('Генерируем план видео');
  });

  it('renders markdown when plan is available', () => {
    const ideasStore = useIdeasStore();
    ideasStore.selectIdea(mockIdea);
    const planStore = usePlanStore();
    planStore.setPlan({ id: 'p-1', title: 'Hello World', markdown: '# Hello World\n\nThis is a test plan.', niche: 'psychology' });

    const wrapper = mountPlanPage();
    expect(wrapper.find('.plan-markdown').exists()).toBe(true);
    expect(wrapper.html()).toContain('<h1>Hello World</h1>');
    expect(wrapper.html()).toContain('This is a test plan.');
  });

  it('renders idea title as heading', () => {
    const ideasStore = useIdeasStore();
    ideasStore.selectIdea(mockIdea);
    const planStore = usePlanStore();
    planStore.setPlan({ id: 'p-2', title: 'Plan content', markdown: '# Plan content', niche: 'psychology' });

    const wrapper = mountPlanPage();
    expect(wrapper.text()).toContain('Test Video Idea');
  });

  it('has back button', () => {
    const wrapper = mountPlanPage();
    expect(wrapper.text()).toContain('Назад к идеям');
  });

  it('triggers plan generation on mount when idea is selected', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ data: { id: 'p-3', title: 'Test Video Idea', markdown: '# Generated plan', niche: 'psychology' } }),
    });

    const ideasStore = useIdeasStore();
    ideasStore.selectIdea(mockIdea);

    mountPlanPage();

    // Wait for onMounted async
    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      title: 'Test Video Idea',
      hook: 'A compelling hook',
      niche: 'psychology',
    });
  });
});
