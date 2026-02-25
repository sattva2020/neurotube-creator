import type { ApiResponse, ApiError } from '@neurotube/shared';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiRequestError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly error: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`;
  console.debug(`[useApi] ${method} ${url}`, body ?? '');

  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url, init);
  console.debug(`[useApi] ${method} ${url} → ${response.status}`);

  if (!response.ok) {
    let apiError: ApiError | undefined;
    try {
      apiError = await response.json() as ApiError;
    } catch {
      // response body is not JSON
    }

    const message = apiError?.message ?? response.statusText;
    console.debug('[useApi] Error response:', apiError ?? response.statusText);
    throw new ApiRequestError(response.status, apiError?.error ?? 'REQUEST_FAILED', message);
  }

  const data = await response.json() as ApiResponse<T>;
  console.debug(`[useApi] ${method} ${url} → data received`);
  return data.data;
}

export function useApi() {
  return {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  };
}
