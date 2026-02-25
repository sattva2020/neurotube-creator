import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { defineComponent } from 'vue';
import ToolsPage from '../ToolsPage.vue';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {} }),
}));

const ToolCardStub = defineComponent({
  name: 'ToolCard',
  props: ['title', 'description', 'icon', 'color', 'loading'],
  emits: ['click'],
  template: '<div class="tool-card-stub" @click="$emit(\'click\')">{{ title }}</div>',
});

const quasarStubs = {
  'q-page': { template: '<div><slot /></div>' },
  'q-btn': {
    template: '<button class="q-btn" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
    inheritAttrs: false,
    emits: ['click'],
  },
  'q-icon': { template: '<i />' },
  ToolCard: ToolCardStub,
  ThumbnailDialog: { template: '<div class="thumbnail-dialog" />', props: ['modelValue'] },
  TitlesDialog: { template: '<div class="titles-dialog" />', props: ['modelValue'] },
  BrandingDialog: { template: '<div class="branding-dialog" />', props: ['modelValue'] },
  MarkdownToolDialog: { template: '<div class="md-dialog" />', props: ['modelValue', 'config'] },
};

function mountToolsPage() {
  return shallowMount(ToolsPage, {
    global: { stubs: quasarStubs },
  });
}

describe('ToolsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockPush.mockReset();
  });

  it('renders page title', () => {
    const wrapper = mountToolsPage();
    expect(wrapper.text()).toContain('AI-инструменты');
  });

  it('renders 10 tool cards', () => {
    const wrapper = mountToolsPage();
    const cards = wrapper.findAllComponents(ToolCardStub);
    expect(cards).toHaveLength(10);
  });

  it('renders expected tool names', () => {
    const wrapper = mountToolsPage();
    const text = wrapper.text();
    expect(text).toContain('Превью');
    expect(text).toContain('Заголовки');
    expect(text).toContain('Описание');
    expect(text).toContain('Брендинг');
    expect(text).toContain('NotebookLM');
    expect(text).toContain('Shorts');
    expect(text).toContain('Анализ ниши');
    expect(text).toContain('Монетизация');
    expect(text).toContain('Контент-план');
    expect(text).toContain('Suno Промпт');
  });

  it('has back navigation button', () => {
    const wrapper = mountToolsPage();
    const btns = wrapper.findAll('.q-btn');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('renders dialog components', () => {
    const wrapper = mountToolsPage();
    expect(wrapper.find('.thumbnail-dialog').exists()).toBe(true);
    expect(wrapper.find('.titles-dialog').exists()).toBe(true);
    expect(wrapper.find('.branding-dialog').exists()).toBe(true);
  });
});
