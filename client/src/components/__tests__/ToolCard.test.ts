import { describe, it, expect, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ToolCard from '../ToolCard.vue';

const quasarStubs = {
  'q-card': {
    template: '<div class="tool-card" v-bind="$attrs" @click="$emit(\'click\')"><slot /></div>',
    inheritAttrs: false,
    emits: ['click'],
  },
  'q-card-section': { template: '<div><slot /></div>' },
  'q-icon': { template: '<i />' },
  'q-inner-loading': { template: '<div v-if="showing" class="inner-loading"><slot /></div>', props: ['showing'] },
  'q-spinner-dots': { template: '<span class="spinner" />' },
};

function mountToolCard(props: Partial<{
  title: string;
  description: string;
  icon: string;
  color: string;
  loading: boolean;
}> = {}) {
  return shallowMount(ToolCard, {
    props: {
      title: props.title ?? 'Превью',
      description: props.description ?? 'AI-генерация обложки',
      icon: props.icon ?? 'image',
      color: props.color ?? 'deep-purple',
      loading: props.loading ?? false,
    },
    global: { stubs: quasarStubs },
  });
}

describe('ToolCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders title', () => {
    const wrapper = mountToolCard();
    expect(wrapper.text()).toContain('Превью');
  });

  it('renders description', () => {
    const wrapper = mountToolCard();
    expect(wrapper.text()).toContain('AI-генерация обложки');
  });

  it('emits click on card click', async () => {
    const wrapper = mountToolCard();
    await wrapper.find('.tool-card').trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('shows loading overlay when loading', () => {
    const wrapper = mountToolCard({ loading: true });
    expect(wrapper.find('.inner-loading').exists()).toBe(true);
  });

  it('hides loading overlay when not loading', () => {
    const wrapper = mountToolCard({ loading: false });
    expect(wrapper.find('.inner-loading').exists()).toBe(false);
  });
});
