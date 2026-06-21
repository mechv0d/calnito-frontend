import type { ApiClient } from './client';
import type { MealType, RecommendationJobResponse, RecommendationLimitResponse, RecommendationResponse } from '../types/api';

const RECOMMENDATION_POLL_INTERVAL_MS = 1200;
const RECOMMENDATION_POLL_TIMEOUT_MS = 90_000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function jobToRecommendation(job: RecommendationJobResponse): RecommendationResponse {
  if (job.status === 'failed') {
    throw new Error(job.error || 'Не удалось подготовить рекомендацию');
  }
  if (job.status !== 'completed' || !job.text) {
    throw new Error('Рекомендация еще готовится');
  }
  return {
    text: job.text,
    meals_analyzed: job.meals_analyzed,
    period: {
      from: job.period?.from || '',
      to: job.period?.to || '',
    },
    kind: job.kind,
    title: job.title,
    limit: job.limit ?? null,
  };
}

async function pollRecommendationJob(api: ApiClient, jobId: string): Promise<RecommendationResponse> {
  const started = Date.now();

  while (Date.now() - started < RECOMMENDATION_POLL_TIMEOUT_MS) {
    const job = await getRecommendationJob(api, jobId);
    if (job.status === 'completed' || job.status === 'failed') {
      return jobToRecommendation(job);
    }
    await wait(RECOMMENDATION_POLL_INTERVAL_MS);
  }

  throw new Error('Рекомендация готовится слишком долго. Она продолжит выполняться на сервере. Попробуйте обновить страницу позже.');
}

export async function getRecommendationLimits(api: ApiClient): Promise<RecommendationLimitResponse> {
  return api.request<RecommendationLimitResponse>('/recommendations/limits');
}

export async function getRecommendationJob(api: ApiClient, jobId: string): Promise<RecommendationJobResponse> {
  return api.request<RecommendationJobResponse>(`/recommendations/jobs/${jobId}`);
}

export async function getRecommendations(api: ApiClient): Promise<RecommendationResponse> {
  const job = await api.request<RecommendationJobResponse>('/recommendations', {
    method: 'POST',
  });
  if (job.status === 'completed' || job.status === 'failed') {
    return jobToRecommendation(job);
  }
  return pollRecommendationJob(api, job.job_id);
}

export async function getNextMealRecommendation(api: ApiClient, mealType: MealType): Promise<RecommendationResponse> {
  const job = await api.request<RecommendationJobResponse>('/recommendations/next-meal', {
    method: 'POST',
    body: JSON.stringify({ meal_type: mealType }),
  });
  if (job.status === 'completed' || job.status === 'failed') {
    return jobToRecommendation(job);
  }
  return pollRecommendationJob(api, job.job_id);
}
