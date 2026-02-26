import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useApi, ApiRequestError } from '../useApi';
import { useAuthStore } from '@/stores/auth';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  };
}

describe('useApi', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockReset();
    setActivePinia(createPinia());
  });

  describe('basic requests (no auth)', () => {
    it('performs GET request and unwraps data', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [{ id: 1 }] }));

      const { get } = useApi();
      const result = await get<{ id: number }[]>('/api/ideas');

      expect(mockFetch).toHaveBeenCalledWith('/api/ideas', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual([{ id: 1 }]);
    });

    it('performs POST request with body', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: { ok: true } }));

      const { post } = useApi();
      const result = await post<{ ok: boolean }>('/api/ideas/generate', { topic: 'test' });

      expect(mockFetch).toHaveBeenCalledWith('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'test' }),
      });
      expect(result).toEqual({ ok: true });
    });

    it('performs DELETE request', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: { success: true } }));

      const { del } = useApi();
      const result = await del<{ success: boolean }>('/api/ideas/uuid-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/ideas/uuid-1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual({ success: true });
    });

    it('performs PATCH request with body', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: { updated: true } }));

      const { patch } = useApi();
      const result = await patch<{ updated: boolean }>('/api/admin/users/1/role', { role: 'admin' });

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/1/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      });
      expect(result).toEqual({ updated: true });
    });
  });

  describe('error handling', () => {
    it('throws ApiRequestError on error response with JSON body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(
          { error: 'VALIDATION_ERROR', message: 'Topic is required', statusCode: 400 },
          400,
        ),
      );

      const { post } = useApi();

      try {
        await post('/api/ideas/generate', {});
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiRequestError);
        expect(err).toMatchObject({
          statusCode: 400,
          error: 'VALIDATION_ERROR',
          message: 'Topic is required',
        });
      }
    });

    it('throws ApiRequestError on error response without JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('not json')),
      });

      const { get } = useApi();

      try {
        await get('/api/health');
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiRequestError);
        expect(err).toMatchObject({
          statusCode: 500,
          message: 'Internal Server Error',
        });
      }
    });
  });

  describe('auth header injection', () => {
    it('injects Authorization header when access token exists', async () => {
      const authStore = useAuthStore();
      authStore.accessToken = 'my-token';

      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      const { get } = useApi();
      await get('/api/ideas');

      expect(mockFetch).toHaveBeenCalledWith('/api/ideas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer my-token',
        },
      });
    });

    it('does not inject Authorization header when no token', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      const { get } = useApi();
      await get('/api/ideas');

      expect(mockFetch).toHaveBeenCalledWith('/api/ideas', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('401 auto-refresh', () => {
    it('retries request after successful token refresh', async () => {
      const authStore = useAuthStore();
      authStore.accessToken = 'expired-token';
      authStore.refreshToken = 'valid-refresh';

      // First call returns 401
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'TOKEN_EXPIRED' }, 401));
      // Refresh call succeeds
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          data: {
            user: { id: '1', email: 'test@test.com', displayName: 'Test', role: 'editor', isActive: true },
            tokens: { accessToken: 'new-token', refreshToken: 'new-refresh' },
          },
        }),
      );
      // Retry call succeeds
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [{ id: 1 }] }));

      const { get } = useApi();
      const result = await get<{ id: number }[]>('/api/ideas');

      expect(result).toEqual([{ id: 1 }]);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('does not retry for auth endpoints', async () => {
      const authStore = useAuthStore();
      authStore.accessToken = 'expired-token';
      authStore.refreshToken = 'valid-refresh';

      mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'INVALID_CREDENTIALS', message: 'Wrong password' }, 401));

      const { post } = useApi();

      try {
        await post('/api/auth/login', { email: 'test@test.com', password: 'wrong' });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiRequestError);
        expect((err as ApiRequestError).statusCode).toBe(401);
      }

      // Only the original call, no refresh attempt
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('throws when refresh fails', async () => {
      const authStore = useAuthStore();
      authStore.accessToken = 'expired-token';
      authStore.refreshToken = 'invalid-refresh';

      // First call returns 401
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'TOKEN_EXPIRED' }, 401));
      // Refresh call fails
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'REFRESH_FAILED' }, 401));

      const { get } = useApi();

      try {
        await get('/api/ideas');
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiRequestError);
        expect((err as ApiRequestError).statusCode).toBe(401);
      }
    });

    it('does not attempt refresh when no refresh token', async () => {
      const authStore = useAuthStore();
      authStore.accessToken = 'expired-token';
      // No refresh token

      mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'TOKEN_EXPIRED' }, 401));

      const { get } = useApi();

      try {
        await get('/api/ideas');
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiRequestError);
      }

      // Only the original call
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
