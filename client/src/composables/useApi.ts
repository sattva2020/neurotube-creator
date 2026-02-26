import type { ApiResponse, ApiError } from '@neurotube/shared';
import { useAuthStore } from '@/stores/auth';

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

function isAuthEndpoint(path: string): boolean {
  return path.startsWith('/api/auth/');
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`;
  console.debug(`[useApi] ${method} ${url}`, body ?? '');

  const authStore = useAuthStore();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authStore.accessToken) {
    headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    console.debug('[useApi] Authorization header injected');
  }

  const init: RequestInit = { method, headers };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let response = await fetch(url, init);
  console.debug(`[useApi] ${method} ${url} → ${response.status}`);

  // 401 auto-refresh (skip for auth endpoints to avoid infinite loops)
  if (response.status === 401 && !isAuthEndpoint(path) && authStore.refreshToken) {
    console.debug('[useApi] 401 received, attempting token refresh');

    // Deduplicate concurrent refresh attempts
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = authStore.refresh();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed && authStore.accessToken) {
      console.debug('[useApi] Token refreshed, retrying request');
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
      const retryInit: RequestInit = { method, headers };
      if (body !== undefined) {
        retryInit.body = JSON.stringify(body);
      }
      response = await fetch(url, retryInit);
      console.debug(`[useApi] Retry ${method} ${url} → ${response.status}`);
    } else {
      console.debug('[useApi] Token refresh failed, not retrying');
    }
  }

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

async function download(path: string): Promise<void> {
  const url = `${BASE_URL}${path}`;
  console.debug(`[useApi] DOWNLOAD ${url}`);

  const authStore = useAuthStore();

  const headers: Record<string, string> = {};
  if (authStore.accessToken) {
    headers['Authorization'] = `Bearer ${authStore.accessToken}`;
  }

  let response = await fetch(url, { method: 'GET', headers });
  console.debug(`[useApi] DOWNLOAD ${url} → ${response.status}`);

  // 401 auto-refresh
  if (response.status === 401 && !isAuthEndpoint(path) && authStore.refreshToken) {
    console.debug('[useApi] 401 on download, attempting token refresh');
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = authStore.refresh();
    }
    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed && authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
      response = await fetch(url, { method: 'GET', headers });
      console.debug(`[useApi] Download retry → ${response.status}`);
    }
  }

  if (!response.ok) {
    const message = response.statusText || 'Download failed';
    console.debug('[useApi] Download error:', message);
    throw new ApiRequestError(response.status, 'DOWNLOAD_FAILED', message);
  }

  // Extract filename from Content-Disposition header
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const filenameMatch = disposition.match(/filename="?([^";\n]+)"?/);
  const filename = filenameMatch?.[1] ?? 'download';

  const blob = await response.blob();
  console.debug(`[useApi] Download complete: ${filename} (${blob.size} bytes)`);

  // Trigger browser download
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

export function useApi() {
  return {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
    patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
    del: <T>(path: string) => request<T>('DELETE', path),
    download,
  };
}
