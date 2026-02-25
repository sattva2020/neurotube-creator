import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ThumbnailDialog from '../ThumbnailDialog.vue';
import { useToolResultsStore } from '@/stores/toolResults';

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
  'q-img': { template: '<img class="q-img" />', props: ['src'] },
  'q-tooltip': { template: '<span />' },
};

function mountDialog(modelValue = true) {
  return shallowMount(ThumbnailDialog, {
    props: { modelValue },
    global: { stubs: quasarStubs },
  });
}

describe('ThumbnailDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('renders dialog title', () => {
    const wrapper = mountDialog();
    expect(wrapper.text()).toContain('Генератор превью');
  });

  it('shows image when result is available', async () => {
    const toolStore = useToolResultsStore();
    toolStore.setResult('thumbnail', 'iVBOR...base64');

    const wrapper = mountDialog();
    expect(wrapper.find('.q-img').exists()).toBe(true);
  });

  it('does not show image when no result', () => {
    const wrapper = mountDialog();
    expect(wrapper.find('.q-img').exists()).toBe(false);
  });
});
