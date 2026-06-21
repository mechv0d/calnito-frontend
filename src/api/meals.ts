import type { ApiClient } from './client';
import type { DayMealsResponse, Meal, MealsRangeResponse, MealUpdateRequest, TodaySummaryResponse } from '../types/api';
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

let todaySummaryInFlight: Promise<TodaySummaryResponse> | null = null;

export async function getTodaySummary(api: ApiClient): Promise<TodaySummaryResponse> {
  if (!todaySummaryInFlight) {
    todaySummaryInFlight = api.request<unknown>('/meals/today')
      .then(normalizeTodaySummary)
      .finally(() => {
        todaySummaryInFlight = null;
      });
  }

  return todaySummaryInFlight;
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
