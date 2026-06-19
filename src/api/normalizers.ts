import { mealTypes, type DayMealsResponse, type Meal, type MealType, type StatsResponse, type TodaySummaryResponse } from '../types/api';

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function objectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function normalizeMealTypeCalories(source: unknown): Record<MealType, number> {
  const record = objectRecord(source);
  return mealTypes.reduce((acc, type) => {
    acc[type] = numberOrZero(record[type]);
    return acc;
  }, {} as Record<MealType, number>);
}

function normalizeMeals(value: unknown): Meal[] {
  return Array.isArray(value) ? (value as Meal[]) : [];
}

export function normalizeTodaySummary(payload: unknown): TodaySummaryResponse {
  const data = objectRecord(payload);
  const meals = normalizeMeals(data.meals);
  const byMealTypeSource = data.by_meal_type ?? data.calories_by_meal_type ?? data.by_type;

  return {
    date: typeof data.date === 'string' ? data.date : '',
    total_calories: numberOrZero(data.total_calories),
    by_meal_type: normalizeMealTypeCalories(byMealTypeSource),
    meals_count: typeof data.meals_count === 'number' ? data.meals_count : meals.length,
    meals,
  };
}

export function normalizeDayMeals(payload: unknown): DayMealsResponse {
  const data = objectRecord(payload);
  const meals = normalizeMeals(data.meals);

  return {
    date: typeof data.date === 'string' ? data.date : '',
    meals,
    total_calories: numberOrZero(data.total_calories),
  };
}

export function normalizeStats(payload: unknown): StatsResponse {
  const data = objectRecord(payload);
  const totals = objectRecord(data.totals);
  const averages = objectRecord(data.averages);
  const period = objectRecord(data.period);

  return {
    period: {
      date_from: typeof period.date_from === 'string' ? period.date_from : typeof period.from === 'string' ? period.from : '',
      date_to: typeof period.date_to === 'string' ? period.date_to : typeof period.to === 'string' ? period.to : '',
    },
    totals: {
      calories: numberOrZero(totals.calories),
      meals_count: numberOrZero(totals.meals_count),
      days_count: numberOrZero(totals.days_count),
      products_count: numberOrZero(totals.products_count),
    },
    averages: {
      calories_per_day: numberOrZero(averages.calories_per_day),
      calories_per_meal: numberOrZero(averages.calories_per_meal),
      products_per_meal: numberOrZero(averages.products_per_meal),
      weight_per_meal_g: numberOrZero(averages.weight_per_meal_g),
    },
    calories_by_day: objectRecord(data.calories_by_day) as Record<string, number>,
    calories_by_meal_type: normalizeMealTypeCalories(data.calories_by_meal_type ?? data.by_meal_type ?? data.by_type),
    top_products_by_frequency: Array.isArray(data.top_products_by_frequency) ? data.top_products_by_frequency as [string, number][] : [],
    top_products_by_calories: Array.isArray(data.top_products_by_calories) ? data.top_products_by_calories as Array<{ product_name: string; calories: number }> : [],
  };
}
