import type { ApiClient } from './client';
import type { StatsResponse } from '../types/api';

export async function getStats(api: ApiClient, dateFrom: string, dateTo: string): Promise<StatsResponse> {
  return api.request<StatsResponse>(`/stats?from=${encodeURIComponent(dateFrom)}&to=${encodeURIComponent(dateTo)}`);
}
