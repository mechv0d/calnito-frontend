import type { ApiClient } from './client';
import type { StatsResponse } from '../types/api';
import { normalizeStats } from './normalizers';

export async function getStats(api: ApiClient, dateFrom: string, dateTo: string): Promise<StatsResponse> {
  const payload = await api.request<unknown>(`/stats?from=${encodeURIComponent(dateFrom)}&to=${encodeURIComponent(dateTo)}`);
  return normalizeStats(payload);
}
