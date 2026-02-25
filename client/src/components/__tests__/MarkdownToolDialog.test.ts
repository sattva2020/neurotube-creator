import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import MarkdownToolDialog from '../MarkdownToolDialog.vue';
import type { MarkdownToolConfig } from '../MarkdownToolDialog.vue';
import { useToolResultsStore } from '@/stores/toolResults';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const quasarStubs = {
  'q-dialog': { template: '<div v-if="modelValue"><slot /></div>', props: ['modelValue'] },
  'q-card': { template: '<div><slot /></div>' },
  'q-card-section': { template: '<div><slot /></div>' },
  'q-input': { template: '<input class="q-input" />', props: ['modelValue'] },
  'q-btn': {
    template: '<button class="q-btn" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
    inheritAttrs: false,
    emits: ['click'],
  },
  'q-icon': { template: '<i />' },
  'q-space': { template: '<span />' },
  'q-banner': { template: '<div class="banner"><slot /></div>' },
};

const mockConfig: MarkdownToolConfig = {
  title: 'Генератор описания',
  icon: 'description',
  color: 'blue',
  toolKey: 'description',
  fields: [
    { key: 'videoTitle', label: 'Заголовок видео' },
    { key: 'niche', label: 'Ниша' },
  ],
  generateFn: vi.fn(() => Promise.resolve()),
};

function mountDialog(config = mockConfig, modelValue = true) {
  return shallowMount(MarkdownToolDialog, {
    props: { config, modelValue },
    global: {
      stubs: {
        ...quasarStubs,
        MarkdownResult: { template: '<div class="markdown-result"><slot /></div>', props: ['content'] },
      },
    },
  });
}

describe('MarkdownToolDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('renders dialog title from config', () => {
    const wrapper = mountDialog();
    expect(wrapper.text()).toContain('Генератор описания');
  });

  it('renders input fields from config', () => {
    const wrapper = mountDialog();
    const inputs = wrapper.findAll('.q-input');
    expect(inputs).toHaveLength(2);
  });

  it('shows markdown result when available', () => {
    const toolStore = useToolResultsStore();
    toolStore.setResult('description', '## Some result');

    const wrapper = mountDialog();
    expect(wrapper.find('.markdown-result').exists()).toBe(true);
  });

  it('does not show result when empty', () => {
    const wrapper = mountDialog();
    expect(wrapper.find('.markdown-result').exists()).toBe(false);
  });
});
