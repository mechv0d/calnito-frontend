import type { ApiClient } from './client';
import type { DayMealsResponse, Meal, MealsRangeResponse, MealUpdateRequest, TodaySummaryResponse } from '../types/api';

export interface CreateMealPayload {
  description: string;
  photo?: File | null;
}

export async function createMeal(api: ApiClient, payload: CreateMealPayload): Promise<Meal> {
  const form = new FormData();
  form.set('description', payload.description);
  if (payload.photo) {
    form.set('photo', payload.photo);
  }
  return api.request<Meal>('/meals', {
    method: 'POST',
    body: form,
  });
}

export async function getTodaySummary(api: ApiClient): Promise<TodaySummaryResponse> {
  return api.request<TodaySummaryResponse>('/meals/today');
}

export async function getMealsByDay(api: ApiClient, date: string): Promise<DayMealsResponse> {
  return api.request<DayMealsResponse>(`/meals/by-day?date=${encodeURIComponent(date)}`);
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
