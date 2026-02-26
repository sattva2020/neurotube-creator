import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import RegisterPage from '../RegisterPage.vue';
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

function mountRegisterPage() {
  return shallowMount(RegisterPage, {
    global: {
      stubs: quasarStubs,
    },
  });
}

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    mockFetch.mockReset();
    mockPush.mockReset();
  });

  it('renders register form', () => {
    const wrapper = mountRegisterPage();
    expect(wrapper.text()).toContain('Регистрация');
    expect(wrapper.text()).toContain('Уже есть аккаунт?');
  });

  it('calls authStore.register on success', async () => {
    const mockAuthResponse = {
      user: { id: '1', email: 'new@test.com', displayName: 'New User', role: 'viewer', isActive: true },
      tokens: { accessToken: 'token', refreshToken: 'refresh' },
    };
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockAuthResponse }));

    mountRegisterPage();
    const authStore = useAuthStore();

    await authStore.register({ displayName: 'New User', email: 'new@test.com', password: 'password123' });

    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.user?.email).toBe('new@test.com');
  });

  it('handles 409 conflict error', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: 'USER_EXISTS', message: 'Email already registered' }, 409),
    );

    mountRegisterPage();
    const authStore = useAuthStore();

    try {
      await authStore.register({ displayName: 'Test', email: 'existing@test.com', password: 'password123' });
    } catch (err) {
      expect((err as Error).message).toBe('Email already registered');
    }

    expect(authStore.isAuthenticated).toBe(false);
  });

  it('has link to login page', () => {
    const wrapper = mountRegisterPage();
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(wrapper.text()).toContain('Войти');
  });
});
