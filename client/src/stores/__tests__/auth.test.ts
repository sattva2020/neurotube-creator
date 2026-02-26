import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';
import type { AuthResponse, UserPublic } from '@neurotube/shared';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockUser: UserPublic = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'editor',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

const mockAuthResponse: AuthResponse = {
  user: mockUser,
  tokens: {
    accessToken: 'access-123',
    refreshToken: 'refresh-456',
  },
};

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  };
}

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockReset();
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('starts with null user and tokens', () => {
      const store = useAuthStore();
      expect(store.user).toBeNull();
      expect(store.accessToken).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.isLoading).toBe(false);
    });

    it('isAuthenticated is false when no token', () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
    });

    it('userRole is null when no user', () => {
      const store = useAuthStore();
      expect(store.userRole).toBeNull();
    });

    it('isAdmin is false when no user', () => {
      const store = useAuthStore();
      expect(store.isAdmin).toBe(false);
    });
  });

  describe('setAuth / clearAuth', () => {
    it('setAuth populates state and localStorage', () => {
      const store = useAuthStore();
      store.setAuth(mockAuthResponse);

      expect(store.user).toEqual(mockUser);
      expect(store.accessToken).toBe('access-123');
      expect(store.refreshToken).toBe('refresh-456');
      expect(store.isAuthenticated).toBe(true);

      const savedTokens = JSON.parse(localStorage.getItem('neurotube-auth-tokens')!);
      expect(savedTokens.accessToken).toBe('access-123');

      const savedUser = JSON.parse(localStorage.getItem('neurotube-auth-user')!);
      expect(savedUser.email).toBe('test@example.com');
    });

    it('clearAuth resets state and localStorage', () => {
      const store = useAuthStore();
      store.setAuth(mockAuthResponse);
      store.clearAuth();

      expect(store.user).toBeNull();
      expect(store.accessToken).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(localStorage.getItem('neurotube-auth-tokens')).toBeNull();
      expect(localStorage.getItem('neurotube-auth-user')).toBeNull();
    });
  });

  describe('computed', () => {
    it('isAdmin is true for owner', () => {
      const store = useAuthStore();
      store.setAuth({ ...mockAuthResponse, user: { ...mockUser, role: 'owner' } });
      expect(store.isAdmin).toBe(true);
    });

    it('isAdmin is true for admin', () => {
      const store = useAuthStore();
      store.setAuth({ ...mockAuthResponse, user: { ...mockUser, role: 'admin' } });
      expect(store.isAdmin).toBe(true);
    });

    it('isAdmin is false for editor', () => {
      const store = useAuthStore();
      store.setAuth(mockAuthResponse); // editor role
      expect(store.isAdmin).toBe(false);
    });

    it('isAdmin is false for viewer', () => {
      const store = useAuthStore();
      store.setAuth({ ...mockAuthResponse, user: { ...mockUser, role: 'viewer' } });
      expect(store.isAdmin).toBe(false);
    });

    it('userRole returns the role', () => {
      const store = useAuthStore();
      store.setAuth(mockAuthResponse);
      expect(store.userRole).toBe('editor');
    });
  });

  describe('login', () => {
    it('calls API and sets auth on success', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockAuthResponse }));

      const store = useAuthStore();
      await store.login({ email: 'test@example.com', password: 'password123' });

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(store.user).toEqual(mockUser);
      expect(store.accessToken).toBe('access-123');
      expect(store.isLoading).toBe(false);
    });

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ error: 'INVALID_CREDENTIALS', message: 'Wrong password' }, 401),
      );

      const store = useAuthStore();
      await expect(store.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Wrong password');
      expect(store.user).toBeNull();
      expect(store.isLoading).toBe(false);
    });
  });

  describe('register', () => {
    it('calls API and sets auth on success', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: mockAuthResponse }));

      const store = useAuthStore();
      await store.register({ email: 'test@example.com', password: 'password123', displayName: 'Test' });

      expect(store.user).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
      expect(store.isLoading).toBe(false);
    });

    it('throws on 409 conflict', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ error: 'USER_EXISTS', message: 'Email already registered' }, 409),
      );

      const store = useAuthStore();
      await expect(
        store.register({ email: 'test@example.com', password: 'password123', displayName: 'Test' }),
      ).rejects.toThrow('Email already registered');
      expect(store.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('calls API and clears auth', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: null }));

      const store = useAuthStore();
      store.setAuth(mockAuthResponse);
      await store.logout();

      expect(store.user).toBeNull();
      expect(store.accessToken).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });

    it('clears auth even if API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const store = useAuthStore();
      store.setAuth(mockAuthResponse);
      await store.logout();

      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('refresh', () => {
    it('refreshes tokens on success', async () => {
      const newResponse: AuthResponse = {
        user: mockUser,
        tokens: { accessToken: 'new-access', refreshToken: 'new-refresh' },
      };
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: newResponse }));

      const store = useAuthStore();
      store.setAuth(mockAuthResponse);
      const result = await store.refresh();

      expect(result).toBe(true);
      expect(store.accessToken).toBe('new-access');
      expect(store.refreshToken).toBe('new-refresh');
    });

    it('clears auth and returns false on failure', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'TOKEN_EXPIRED' }, 401));

      const store = useAuthStore();
      store.setAuth(mockAuthResponse);
      const result = await store.refresh();

      expect(result).toBe(false);
      expect(store.user).toBeNull();
      expect(store.accessToken).toBeNull();
    });

    it('returns false when no refresh token', async () => {
      const store = useAuthStore();
      const result = await store.refresh();
      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('initFromStorage', () => {
    it('restores tokens and user from localStorage', () => {
      localStorage.setItem('neurotube-auth-tokens', JSON.stringify(mockAuthResponse.tokens));
      localStorage.setItem('neurotube-auth-user', JSON.stringify(mockUser));

      const store = useAuthStore();
      store.initFromStorage();

      expect(store.accessToken).toBe('access-123');
      expect(store.refreshToken).toBe('refresh-456');
      expect(store.user?.email).toBe('test@example.com');
      expect(store.isAuthenticated).toBe(true);
    });

    it('handles empty localStorage', () => {
      const store = useAuthStore();
      store.initFromStorage();

      expect(store.accessToken).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });

    it('handles corrupted localStorage', () => {
      localStorage.setItem('neurotube-auth-tokens', 'not-json');
      localStorage.setItem('neurotube-auth-user', 'not-json');

      const store = useAuthStore();
      store.initFromStorage();

      expect(store.accessToken).toBeNull();
      expect(store.user).toBeNull();
    });
  });

  describe('fetchMe', () => {
    it('fetches current user and updates state', async () => {
      const updatedUser = { ...mockUser, displayName: 'Updated Name' };
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: updatedUser }));

      const store = useAuthStore();
      store.setAuth(mockAuthResponse);
      await store.fetchMe();

      expect(store.user?.displayName).toBe('Updated Name');
    });

    it('skips when no access token', async () => {
      const store = useAuthStore();
      await store.fetchMe();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
