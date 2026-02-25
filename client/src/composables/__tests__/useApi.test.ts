import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useApi, ApiRequestError } from '../useApi';

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
    mockFetch.mockReset();
  });

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
