import type { ApiClient } from './client';
import type { UserProfileResponse } from '../types/api';

export async function getMe(api: ApiClient): Promise<UserProfileResponse> {
  return api.request<UserProfileResponse>('/users/me');
}

export async function updateMe(api: ApiClient, timezone: string): Promise<UserProfileResponse> {
  return api.request<UserProfileResponse>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ timezone }),
  });
}
