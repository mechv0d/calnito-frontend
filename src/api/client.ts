import { ApiError } from '../lib/errors';
import { getBrowserTimezone } from '../lib/timezone';

export type TokenGetter = () => Promise<string>;

export interface ApiRequestInit extends RequestInit {
  dedupeKey?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/v1').replace(/\/$/, '');
const SLOW_REQUEST_WARNING_MS = 1000;
const inflightRequests = new Map<string, Promise<unknown>>();

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204) {
    return null;
  }
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

function extractApiMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'detail' in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((item) => JSON.stringify(item)).join('\n');
  }
  if (typeof payload === 'string' && payload.trim()) return payload;
  return fallback;
}

export class ApiClient {
  constructor(private readonly getToken: TokenGetter) {}

  async request<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
    const { dedupeKey, ...fetchInit } = init;
    if (dedupeKey) {
      const existing = inflightRequests.get(dedupeKey);
      if (existing) return existing as Promise<T>;

      const promise = this.request<T>(path, fetchInit).finally(() => {
        inflightRequests.delete(dedupeKey);
      });
      inflightRequests.set(dedupeKey, promise);
      return promise;
    }

    const started = performance.now();
    const token = await this.getToken();
    const headers = new Headers(fetchInit.headers);

    if (!(fetchInit.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('X-Timezone', getBrowserTimezone());

    const method = fetchInit.method || 'GET';
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      ...fetchInit,
      headers,
    });

    const elapsedMs = performance.now() - started;
    if (elapsedMs >= SLOW_REQUEST_WARNING_MS) {
      const backendMs = response.headers.get('X-Process-Time-Ms');
      console.warn(
        `[api] ${method} ${url} took ${elapsedMs.toFixed(0)}ms${backendMs ? `; backend=${backendMs}ms` : ''}`,
      );
    }

    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new ApiError(extractApiMessage(payload, `HTTP ${response.status}`), response.status, payload);
    }
    return payload as T;
  }
}
