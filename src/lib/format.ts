import { MEAL_TYPE_LABELS, type MealType } from '../types/api';

export function formatCalories(value: number | undefined | null): string {
  return `${Math.round(value ?? 0)} ккал`;
}

export function formatWeight(value: number | undefined | null): string {
  return `${Math.round(value ?? 0)} г`;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatMealType(type: MealType): string {
  return MEAL_TYPE_LABELS[type] ?? type;
}
