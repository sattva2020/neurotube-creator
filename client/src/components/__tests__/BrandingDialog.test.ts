import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BrandingDialog from '../BrandingDialog.vue';
import { useToolResultsStore } from '@/stores/toolResults';

vi.mock('quasar', () => ({
  copyToClipboard: vi.fn(() => Promise.resolve()),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const quasarStubs = {
  'q-dialog': { template: '<div v-if="modelValue"><slot /></div>', props: ['modelValue'] },
  'q-card': { template: '<div class="q-card"><slot /></div>' },
  'q-card-section': { template: '<div><slot /></div>' },
  'q-input': { template: '<input />', props: ['modelValue'] },
  'q-select': { template: '<select />', props: ['modelValue'] },
  'q-btn': {
    template: '<button class="q-btn" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
    inheritAttrs: false,
    emits: ['click'],
  },
  'q-icon': { template: '<i />' },
  'q-space': { template: '<span />' },
  'q-banner': { template: '<div class="banner"><slot /></div>' },
  'q-chip': { template: '<span class="q-chip"><slot /></span>' },
  'q-tooltip': { template: '<span />' },
};

function mountDialog(modelValue = true) {
  return shallowMount(BrandingDialog, {
    props: { modelValue },
    global: { stubs: quasarStubs },
  });
}

describe('BrandingDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
  });

  it('renders dialog title', () => {
    const wrapper = mountDialog();
    expect(wrapper.text()).toContain('Генератор брендинга');
  });

  it('renders branding data when available', () => {
    const toolStore = useToolResultsStore();
    toolStore.setResult('branding', {
      channelNames: ['NeuroVibe', 'BrainWave'],
      seoDescription: 'A channel about neuroscience',
      avatarPrompt: 'Minimalist brain icon',
      bannerPrompt: 'Neural network art',
    });

    const wrapper = mountDialog();
    expect(wrapper.text()).toContain('A channel about neuroscience');
    expect(wrapper.findAll('.q-chip')).toHaveLength(2);
  });

  it('does not render branding when no result', () => {
    const wrapper = mountDialog();
    expect(wrapper.findAll('.q-chip')).toHaveLength(0);
  });
});
