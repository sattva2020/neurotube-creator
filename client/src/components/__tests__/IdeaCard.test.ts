import { describe, it, expect, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import IdeaCard from '../IdeaCard.vue';
import type { VideoIdea } from '@neurotube/shared';

const mockIdea: VideoIdea = {
  title: 'Dopamine Detox Guide',
  hook: 'What if everything you enjoy is slowly destroying your brain?',
  targetAudience: 'Self-improvement enthusiasts',
  whyItWorks: 'High search volume, emotional trigger',
  searchVolume: 'High',
  primaryKeyword: 'dopamine detox',
  secondaryKeywords: ['brain health', 'digital detox'],
  niche: 'psychology',
};

const quasarStubs = {
  'q-card': { template: '<div class="idea-card" v-bind="$attrs"><slot /></div>', inheritAttrs: false },
  'q-card-section': { template: '<div><slot /></div>' },
  'q-card-actions': { template: '<div class="q-card__actions"><slot /></div>' },
  'q-separator': { template: '<hr />' },
  'q-badge': { template: '<span><slot /></span>' },
  'q-chip': { template: '<span><slot /></span>' },
  'q-icon': { template: '<i />' },
  'q-btn': {
    template: '<button class="q-btn" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
    inheritAttrs: false,
    emits: ['click'],
  },
};

function mountIdeaCard(props: Partial<{ idea: VideoIdea; isSelected: boolean }> = {}) {
  return shallowMount(IdeaCard, {
    props: {
      idea: props.idea ?? mockIdea,
      isSelected: props.isSelected ?? false,
    },
    global: {
      stubs: quasarStubs,
    },
  });
}

describe('IdeaCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders idea title', () => {
    const wrapper = mountIdeaCard();
    expect(wrapper.text()).toContain('Dopamine Detox Guide');
  });

  it('renders search volume', () => {
    const wrapper = mountIdeaCard();
    expect(wrapper.text()).toContain('High');
  });

  it('renders target audience', () => {
    const wrapper = mountIdeaCard();
    expect(wrapper.text()).toContain('Self-improvement enthusiasts');
  });

  it('renders primary keyword', () => {
    const wrapper = mountIdeaCard();
    expect(wrapper.text()).toContain('dopamine detox');
  });

  it('renders secondary keywords', () => {
    const wrapper = mountIdeaCard();
    expect(wrapper.text()).toContain('brain health');
    expect(wrapper.text()).toContain('digital detox');
  });

  it('renders hook text', () => {
    const wrapper = mountIdeaCard();
    expect(wrapper.text()).toContain('everything you enjoy is slowly destroying');
  });

  it('renders why it works', () => {
    const wrapper = mountIdeaCard();
    expect(wrapper.text()).toContain('High search volume');
  });

  it('shows action button when not selected', () => {
    const wrapper = mountIdeaCard({ isSelected: false });
    expect(wrapper.find('.q-card__actions').exists()).toBe(true);
  });

  it('hides action button when selected', () => {
    const wrapper = mountIdeaCard({ isSelected: true });
    expect(wrapper.find('.q-card__actions').exists()).toBe(false);
  });

  it('emits select on card click', async () => {
    const wrapper = mountIdeaCard();
    await wrapper.find('.idea-card').trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual([mockIdea]);
  });

  it('emits generate-plan on button click', async () => {
    const wrapper = mountIdeaCard({ isSelected: false });
    const btn = wrapper.find('.q-card__actions .q-btn');
    await btn.trigger('click');
    expect(wrapper.emitted('generate-plan')).toBeTruthy();
    expect(wrapper.emitted('generate-plan')![0]).toEqual([mockIdea]);
  });
});
