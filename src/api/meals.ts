import type { ApiClient } from './client';
import type {
  DayMealsResponse,
  ManualMealCreateRequest,
  Meal,
  MealsRangeResponse,
  MealUpdateRequest,
  ProductSuggestionsResponse,
  TodaySummaryResponse,
} from '../types/api';
import { normalizeDayMeals, normalizeTodaySummary } from './normalizers';

export interface CreateMealPayload {
  description: string;
  photo?: File | null;
  photos?: File[];
}

export async function createMeal(api: ApiClient, payload: CreateMealPayload): Promise<Meal> {
  const form = new FormData();
  form.set('description', payload.description);
  if (payload.photo) {
    form.set('photo', payload.photo);
  }
  for (const photo of payload.photos ?? []) {
    form.append('photos', photo);
  }
  return api.request<Meal>('/meals', {
    method: 'POST',
    body: form,
  });
}

export async function createManualMeal(api: ApiClient, payload: ManualMealCreateRequest): Promise<Meal> {
  return api.request<Meal>('/meals/manual', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMeal(api: ApiClient, mealId: string): Promise<Meal> {
  return api.request<Meal>(`/meals/${mealId}`);
}

export async function getTodaySummary(api: ApiClient): Promise<TodaySummaryResponse> {
  const payload = await api.request<unknown>('/meals/today', { dedupeKey: 'GET:/meals/today' });
  return normalizeTodaySummary(payload);
}

export async function getMealsByDay(api: ApiClient, date: string): Promise<DayMealsResponse> {
  const payload = await api.request<unknown>(`/meals/by-day?date=${encodeURIComponent(date)}`);
  return normalizeDayMeals(payload);
}

export async function getMealsRange(api: ApiClient, dateFrom: string, dateTo: string): Promise<MealsRangeResponse> {
  return api.request<MealsRangeResponse>(`/meals?from=${encodeURIComponent(dateFrom)}&to=${encodeURIComponent(dateTo)}`);
}

export async function updateMeal(api: ApiClient, mealId: string, payload: MealUpdateRequest): Promise<Meal> {
  return api.request<Meal>(`/meals/${mealId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteMeal(api: ApiClient, mealId: string): Promise<{ ok: boolean; deleted_id: string }> {
  return api.request<{ ok: boolean; deleted_id: string }>(`/meals/${mealId}`, {
    method: 'DELETE',
  });
}

export async function getPopularProducts(
  api: ApiClient,
  params: { query?: string; page?: number; pageSize?: number } = {},
): Promise<ProductSuggestionsResponse> {
  const query = new URLSearchParams();
  if (params.query?.trim()) query.set('q', params.query.trim());
  query.set('page', String(params.page ?? 1));
  query.set('page_size', String(params.pageSize ?? 20));
  return api.request<ProductSuggestionsResponse>(`/meals/products/popular?${query.toString()}`);
}
