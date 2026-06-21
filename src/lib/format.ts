import { MEAL_TYPE_LABELS, type MealType } from '../types/api';

export function formatCalories(value: number | undefined | null): string {
  return `${Math.round(value ?? 0)} ккал`;
}

export function formatWeight(value: number | undefined | null): string {
  return `${Math.round(value ?? 0)} г`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return 'Дата не указана';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 'Дата не указана';
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) return 'Дата не указана';
  const date = typeof value === 'string' ? new Date(`${value}T12:00:00`) : value;
  if (Number.isNaN(date.getTime())) return 'Дата не указана';
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatMealType(type: MealType): string {
  return MEAL_TYPE_LABELS[type] ?? type;
}
