import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import TitlesDialog from '../TitlesDialog.vue';
import { useToolResultsStore } from '@/stores/toolResults';

vi.mock('quasar', () => ({
  copyToClipboard: vi.fn(() => Promise.resolve()),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const quasarStubs = {
  'q-dialog': { template: '<div v-if="modelValue"><slot /></div>', props: ['modelValue'] },
  'q-card': { template: '<div><slot /></div>' },
  'q-card-section': { template: '<div><slot /></div>' },
  'q-input': { template: '<input />', props: ['modelValue'] },
  'q-btn': {
    template: '<button class="q-btn" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
    inheritAttrs: false,
    emits: ['click'],
  },
  'q-icon': { template: '<i />' },
  'q-space': { template: '<span />' },
  'q-banner': { template: '<div class="banner"><slot /></div>' },
  'q-list': { template: '<div class="q-list"><slot /></div>' },
  'q-item': { template: '<div class="q-item"><slot /></div>' },
  'q-item-section': { template: '<div><slot /></div>' },
  'q-item-label': { template: '<span><slot /></span>' },
  'q-tooltip': { template: '<span />' },
};

function mountDialog(modelValue = true) {
  return shallowMount(TitlesDialog, {
    props: { modelValue },
    global: { stubs: quasarStubs },
  });
}

describe('TitlesDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('renders dialog title', () => {
    const wrapper = mountDialog();
    expect(wrapper.text()).toContain('Генератор заголовков');
  });

  it('renders titles list when results available', () => {
    const toolStore = useToolResultsStore();
    toolStore.setResult('titles', ['Title A', 'Title B', 'Title C']);

    const wrapper = mountDialog();
    expect(wrapper.find('.q-list').exists()).toBe(true);
    expect(wrapper.findAll('.q-item')).toHaveLength(3);
  });

  it('does not render list when no results', () => {
    const wrapper = mountDialog();
    expect(wrapper.find('.q-list').exists()).toBe(false);
  });
});
