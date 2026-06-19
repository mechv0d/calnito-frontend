import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiClient } from './client';
import { ApiError } from '../lib/errors';

describe('ApiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds auth and timezone headers', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    const api = new ApiClient(async () => 'token-123');
    await api.request('/users/me');
    const [, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token-123');
    expect(headers.get('X-Timezone')).toBeTruthy();
  });

  it('throws backend detail as message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Мы проебались, Босс.' }), { status: 503, headers: { 'content-type': 'application/json' } }),
    );
    const api = new ApiClient(async () => 'token-123');
    await expect(api.request('/meals')).rejects.toMatchObject(new ApiError('Мы проебались, Босс.', 503, { detail: 'Мы проебались, Босс.' }));
  });
});
