import { ApiError } from '../lib/errors';
import { getBrowserTimezone } from '../lib/timezone';

export type TokenGetter = () => Promise<string>;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/v1').replace(/\/$/, '');

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

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const headers = new Headers(init.headers);

    if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('X-Timezone', getBrowserTimezone());

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });

    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new ApiError(extractApiMessage(payload, `HTTP ${response.status}`), response.status, payload);
    }
    return payload as T;
  }
}
