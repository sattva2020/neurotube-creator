import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import MarkdownResult from '../MarkdownResult.vue';

vi.mock('quasar', () => ({
  copyToClipboard: vi.fn(() => Promise.resolve()),
}));

const quasarStubs = {
  'q-btn': {
    template: '<button class="q-btn" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
    inheritAttrs: false,
    emits: ['click'],
  },
  'q-tooltip': { template: '<span><slot /></span>' },
};

function mountMarkdownResult(content = '## Hello World') {
  return shallowMount(MarkdownResult, {
    props: { content },
    global: { stubs: quasarStubs },
  });
}

describe('MarkdownResult', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders markdown as HTML', () => {
    const wrapper = mountMarkdownResult('## Hello World');
    expect(wrapper.html()).toContain('<h2>Hello World</h2>');
  });

  it('renders empty string for empty content', () => {
    const wrapper = mountMarkdownResult('');
    expect(wrapper.find('.markdown-result__body').html()).not.toContain('<h');
  });

  it('renders paragraphs', () => {
    const wrapper = mountMarkdownResult('This is a paragraph.');
    expect(wrapper.html()).toContain('<p>This is a paragraph.</p>');
  });

  it('has copy button', () => {
    const wrapper = mountMarkdownResult('test');
    expect(wrapper.find('.q-btn').exists()).toBe(true);
  });
});
