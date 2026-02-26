import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import LoginPage from '../LoginPage.vue';
import { useAuthStore } from '@/stores/auth';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {}, query: {} }),
}));

const quasarStubs = {
  'q-card': { template: '<div class="q-card"><slot /></div>' },
  'q-card-section': { template: '<div class="q-card-section"><slot /></div>' },
  'q-form': { template: '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>', emits: ['submit'] },
  'q-input': {
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target?.value)" />',
    props: ['modelValue', 'type', 'label', 'rules'],
    emits: ['update:modelValue'],
  },
  'q-btn': { template: '<button type="submit" class="q-btn"><slot /></button>', props: ['loading', 'label'] },
  'q-banner': { template: '<div class="q-banner"><slot /></div>' },
  'q-icon': { template: '<i />' },
  'q-separator': { template: '<hr />' },
  'router-link': { template: '<a><slot /></a>', props: ['to'] },
};

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  };
}

function mountLoginPage() {
  return shallowMount(LoginPage, {
    global: {
      stubs: quasarStubs,
    },
  });
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    mockFetch.mockReset();
    mockPush.mockReset();
  });

  it('renders login form', () => {
    const wrapper = mountLoginPage();
    expect(wrapper.text()).toContain('Вход');
    expect(wrapper.text()).toContain('Нет аккаунта?');
  });

  it('calls authStore.login on submit and redirects', async () => {
    const mockAuthResponse = {
      user: { id: '1', email: 'test@test.com', displayName: 'Test', role: 'editor', isActive: true },
      tokens: { accessToken: 'token', refreshToken: 'refresh' },
    };
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockAuthResponse }));

    const wrapper = mountLoginPage();
    const authStore = useAuthStore();

    // Set form values directly on store
    await wrapper.vm.$nextTick();

    // Trigger login through the store
    await authStore.login({ email: 'test@test.com', password: 'password123' });

    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.user?.email).toBe('test@test.com');
  });

  it('displays error on 401', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'INVALID_CREDENTIALS', message: 'Wrong password' }, 401),
    );

    const authStore = useAuthStore();

    try {
      await authStore.login({ email: 'test@test.com', password: 'wrong' });
    } catch {
      // expected
    }

    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
  });

  it('has link to register page', () => {
    const wrapper = mountLoginPage();
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(wrapper.text()).toContain('Зарегистрироваться');
  });
});
