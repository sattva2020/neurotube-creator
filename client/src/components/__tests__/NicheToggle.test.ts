import { describe, it, expect, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { defineComponent } from 'vue';
import NicheToggle from '../NicheToggle.vue';
import { useNicheStore } from '@/stores/niche';
import { useIdeasStore } from '@/stores/ideas';

const QBtnToggleStub = defineComponent({
  name: 'QBtnToggle',
  props: ['modelValue', 'options', 'toggleColor', 'rounded', 'unelevated'],
  emits: ['update:modelValue'],
  template: '<div class="q-btn-toggle-stub" />',
});

function mountNicheToggle() {
  return shallowMount(NicheToggle, {
    global: {
      stubs: {
        'q-btn-toggle': QBtnToggleStub,
      },
    },
  });
}

describe('NicheToggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders without errors', () => {
    const wrapper = mountNicheToggle();
    expect(wrapper.exists()).toBe(true);
  });

  it('defaults to psychology niche', () => {
    mountNicheToggle();
    const nicheStore = useNicheStore();
    expect(nicheStore.active).toBe('psychology');
  });

  it('clears ideas store when toggled', async () => {
    const wrapper = mountNicheToggle();
    const ideasStore = useIdeasStore();
    ideasStore.setIdeas([
      {
        title: 'Test',
        hook: 'hook',
        targetAudience: 'audience',
        whyItWorks: 'reason',
        searchVolume: 'High',
        primaryKeyword: 'kw',
        secondaryKeywords: [],
        niche: 'psychology',
      },
    ]);
    expect(ideasStore.items).toHaveLength(1);

    const toggle = wrapper.findComponent(QBtnToggleStub);
    await toggle.vm.$emit('update:modelValue', 'ambient');

    expect(ideasStore.items).toEqual([]);
  });

  it('passes options with niche values', () => {
    const wrapper = mountNicheToggle();
    const toggle = wrapper.findComponent(QBtnToggleStub);
    const options = toggle.props('options');
    expect(options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'psychology' }),
        expect.objectContaining({ value: 'ambient' }),
      ]),
    );
  });
});
