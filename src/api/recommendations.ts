import type { ApiClient } from './client';
import type { RecommendationResponse } from '../types/api';

export async function getRecommendations(api: ApiClient): Promise<RecommendationResponse> {
  return api.request<RecommendationResponse>('/recommendations', {
    method: 'POST',
  });
}
