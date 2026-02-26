import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserPublic, AuthTokens, AuthResponse, LoginRequest, RegisterRequest } from '@neurotube/shared';

const TOKENS_KEY = 'neurotube-auth-tokens';
const USER_KEY = 'neurotube-auth-user';

function loadTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    if (raw) {
      const tokens = JSON.parse(raw) as AuthTokens;
      if (tokens.accessToken && tokens.refreshToken) {
        console.debug('[AuthStore] Loaded tokens from localStorage');
        return tokens;
      }
    }
  } catch {
    console.debug('[AuthStore] Failed to load tokens from localStorage');
  }
  return null;
}

function loadUser(): UserPublic | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const user = JSON.parse(raw) as UserPublic;
      if (user.id && user.email) {
        console.debug('[AuthStore] Loaded user from localStorage:', user.email);
        return user;
      }
    }
  } catch {
    console.debug('[AuthStore] Failed to load user from localStorage');
  }
  return null;
}

function saveTokens(tokens: AuthTokens): void {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    console.debug('[AuthStore] Saved tokens to localStorage');
  } catch {
    console.debug('[AuthStore] Failed to save tokens to localStorage');
  }
}

function saveUser(user: UserPublic): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.debug('[AuthStore] Saved user to localStorage:', user.email);
  } catch {
    console.debug('[AuthStore] Failed to save user to localStorage');
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(TOKENS_KEY);
    localStorage.removeItem(USER_KEY);
    console.debug('[AuthStore] Cleared auth data from localStorage');
  } catch {
    console.debug('[AuthStore] Failed to clear localStorage');
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function authRequest<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  console.debug(`[AuthStore] ${method} ${url}`);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url, init);
  console.debug(`[AuthStore] ${method} ${url} → ${response.status}`);

  if (!response.ok) {
    let errorData: { message?: string; error?: string } | undefined;
    try {
      errorData = await response.json();
    } catch {
      // not JSON
    }
    const message = errorData?.message ?? response.statusText;
    const error = new Error(message) as Error & { statusCode: number; errorCode: string };
    error.statusCode = response.status;
    error.errorCode = errorData?.error ?? 'AUTH_ERROR';
    throw error;
  }

  const data = await response.json();
  return data.data as T;
}

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const user = ref<UserPublic | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);

  // --- Computed ---
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const userRole = computed(() => user.value?.role ?? null);
  const isAdmin = computed(() => {
    const role = user.value?.role;
    return role === 'owner' || role === 'admin';
  });

  // --- Actions ---
  function setAuth(authResponse: AuthResponse): void {
    console.debug('[AuthStore] setAuth:', authResponse.user.email, authResponse.user.role);
    user.value = authResponse.user;
    accessToken.value = authResponse.tokens.accessToken;
    refreshToken.value = authResponse.tokens.refreshToken;
    saveTokens(authResponse.tokens);
    saveUser(authResponse.user);
  }

  function clearAuth(): void {
    console.debug('[AuthStore] clearAuth');
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    clearStorage();
  }

  async function login(credentials: LoginRequest): Promise<void> {
    console.debug('[AuthStore] login:', credentials.email);
    isLoading.value = true;
    try {
      const response = await authRequest<AuthResponse>('POST', '/api/auth/login', credentials);
      setAuth(response);
      console.debug('[AuthStore] login successful:', response.user.email);
    } finally {
      isLoading.value = false;
    }
  }

  async function register(data: RegisterRequest): Promise<void> {
    console.debug('[AuthStore] register:', data.email);
    isLoading.value = true;
    try {
      const response = await authRequest<AuthResponse>('POST', '/api/auth/register', data);
      setAuth(response);
      console.debug('[AuthStore] register successful:', response.user.email);
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    console.debug('[AuthStore] logout');
    isLoading.value = true;
    try {
      if (refreshToken.value) {
        await authRequest('POST', '/api/auth/logout', { refreshToken: refreshToken.value }, accessToken.value ?? undefined);
      }
    } catch (err) {
      console.debug('[AuthStore] logout API call failed (clearing locally anyway):', err);
    } finally {
      clearAuth();
      isLoading.value = false;
    }
  }

  async function refresh(): Promise<boolean> {
    console.debug('[AuthStore] refresh tokens');
    if (!refreshToken.value) {
      console.debug('[AuthStore] no refresh token, cannot refresh');
      return false;
    }
    try {
      const response = await authRequest<AuthResponse>('POST', '/api/auth/refresh', {
        refreshToken: refreshToken.value,
      });
      setAuth(response);
      console.debug('[AuthStore] refresh successful');
      return true;
    } catch (err) {
      console.debug('[AuthStore] refresh failed, clearing auth:', err);
      clearAuth();
      return false;
    }
  }

  async function fetchMe(): Promise<void> {
    console.debug('[AuthStore] fetchMe');
    if (!accessToken.value) {
      console.debug('[AuthStore] no access token, skipping fetchMe');
      return;
    }
    try {
      const me = await authRequest<UserPublic>('GET', '/api/auth/me', undefined, accessToken.value);
      user.value = me;
      saveUser(me);
      console.debug('[AuthStore] fetchMe successful:', me.email, me.role);
    } catch (err) {
      console.debug('[AuthStore] fetchMe failed:', err);
      // If 401, try refresh
      const error = err as { statusCode?: number };
      if (error.statusCode === 401) {
        const refreshed = await refresh();
        if (refreshed && accessToken.value) {
          const me = await authRequest<UserPublic>('GET', '/api/auth/me', undefined, accessToken.value);
          user.value = me;
          saveUser(me);
          console.debug('[AuthStore] fetchMe after refresh successful:', me.email);
        }
      }
    }
  }

  function initFromStorage(): void {
    console.debug('[AuthStore] initFromStorage');
    const savedTokens = loadTokens();
    const savedUser = loadUser();

    if (savedTokens) {
      accessToken.value = savedTokens.accessToken;
      refreshToken.value = savedTokens.refreshToken;
      console.debug('[AuthStore] restored tokens from storage');
    }
    if (savedUser) {
      user.value = savedUser;
      console.debug('[AuthStore] restored user from storage:', savedUser.email);
    }
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    // Computed
    isAuthenticated,
    userRole,
    isAdmin,
    // Actions
    setAuth,
    clearAuth,
    login,
    register,
    logout,
    refresh,
    fetchMe,
    initFromStorage,
  };
});
