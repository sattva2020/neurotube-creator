import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { defineComponent } from 'vue';
import IndexPage from '../IndexPage.vue';
import { useIdeasStore } from '@/stores/ideas';
import { useNicheStore } from '@/stores/niche';
import type { VideoIdea } from '@neurotube/shared';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}));

const quasarStubs = {
  'q-page': { template: '<div><slot /></div>' },
  'q-form': { template: '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>', emits: ['submit'] },
  'q-input': { template: '<input />', props: ['modelValue'] },
  'q-chip': { template: '<span class="q-chip"><slot /></span>', props: ['clickable'] },
  'q-btn': { template: '<button class="q-btn"><slot /></button>' },
  'q-banner': { template: '<div class="q-banner"><slot /><slot name="avatar" /><slot name="action" /></div>' },
  'q-badge': { template: '<span><slot /></span>' },
  'q-icon': { template: '<i />' },
  NicheToggle: defineComponent({ name: 'NicheToggle', template: '<div class="niche-toggle-stub" />' }),
  IdeaCard: defineComponent({
    name: 'IdeaCard',
    props: ['idea', 'isSelected'],
    emits: ['select', 'generate-plan'],
    template: '<div class="idea-card-stub">{{ idea.title }}</div>',
  }),
};

function mountIndexPage() {
  return shallowMount(IndexPage, {
    global: {
      stubs: quasarStubs,
    },
  });
}

const mockIdea: VideoIdea = {
  title: 'Test Idea',
  hook: 'A hook',
  targetAudience: 'Audience',
  whyItWorks: 'Works',
  searchVolume: 'High',
  primaryKeyword: 'kw',
  secondaryKeywords: [],
  niche: 'psychology',
};

describe('IndexPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
    mockPush.mockReset();
  });

  it('renders hero title for psychology niche', () => {
    const wrapper = mountIndexPage();
    expect(wrapper.text()).toContain('Найдите Идею для Вирусного Видео');
  });

  it('renders hero title for ambient niche', () => {
    const nicheStore = useNicheStore();
    nicheStore.set('ambient');
    const wrapper = mountIndexPage();
    expect(wrapper.text()).toContain('Создайте Эмбиент-Контент');
  });

  it('renders NicheToggle component', () => {
    const wrapper = mountIndexPage();
    expect(wrapper.find('.niche-toggle-stub').exists()).toBe(true);
  });

  it('renders preset chips for psychology niche', () => {
    const wrapper = mountIndexPage();
    expect(wrapper.text()).toContain('Dopamine Detox');
    expect(wrapper.text()).toContain('Habit Formation');
  });

  it('renders preset chips for ambient niche', () => {
    const nicheStore = useNicheStore();
    nicheStore.set('ambient');
    const wrapper = mountIndexPage();
    expect(wrapper.text()).toContain('Urban Rain Focus');
    expect(wrapper.text()).toContain('Binaural Beats Study');
  });

  it('renders idea cards when ideas exist', () => {
    const ideasStore = useIdeasStore();
    ideasStore.setIdeas([mockIdea]);
    const wrapper = mountIndexPage();
    const cards = wrapper.findAllComponents({ name: 'IdeaCard' });
    expect(cards).toHaveLength(1);
  });

  it('does not render idea cards when empty', () => {
    const wrapper = mountIndexPage();
    const cards = wrapper.findAllComponents({ name: 'IdeaCard' });
    expect(cards).toHaveLength(0);
  });

  it('navigates to plan page on generate-plan event', async () => {
    const ideasStore = useIdeasStore();
    ideasStore.setIdeas([mockIdea]);
    const wrapper = mountIndexPage();
    const card = wrapper.findComponent({ name: 'IdeaCard' });
    await card.vm.$emit('generate-plan', mockIdea);
    expect(mockPush).toHaveBeenCalledWith({ name: 'plan' });
  });

  it('selects idea on select event', async () => {
    const ideasStore = useIdeasStore();
    ideasStore.setIdeas([mockIdea]);
    const wrapper = mountIndexPage();
    const card = wrapper.findComponent({ name: 'IdeaCard' });
    await card.vm.$emit('select', mockIdea);
    expect(ideasStore.selected).toEqual(mockIdea);
  });
});
