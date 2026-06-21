import type { ApiClient } from './client';
import type { RecommendationLimitResponse, RecommendationResponse } from '../types/api';

export async function getRecommendationLimits(api: ApiClient): Promise<RecommendationLimitResponse> {
  return api.request<RecommendationLimitResponse>('/recommendations/limits');
}

export async function getRecommendations(api: ApiClient): Promise<RecommendationResponse> {
  return api.request<RecommendationResponse>('/recommendations', {
    method: 'POST',
  });
}

export async function getNextMealRecommendation(api: ApiClient): Promise<RecommendationResponse> {
  return api.request<RecommendationResponse>('/recommendations/next-meal', {
    method: 'POST',
  });
}
