export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || import.meta.env.VITE_DEFAULT_TIMEZONE || 'UTC';
}

function asDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDatetimeLocalValue(value: string | Date | null | undefined): string {
  const date = asDate(value) ?? new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export function todayISO(): string {
  return toDateInputValue(new Date());
}

export function daysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateInputValue(date);
}

export function addDaysISO(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return todayISO();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function yesterdayISO(): string {
  return addDaysISO(todayISO(), -1);
}

export function toDateInputValue(value: string | Date | null | undefined): string {
  const date = asDate(typeof value === 'string' && !value.includes('T') ? `${value}T12:00:00` : value);
  if (!date) return todayISO();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toTimeInputValue(value: string | Date | null | undefined): string {
  const date = asDate(value) ?? new Date();
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function combineLocalDateTime(dateValue: string, timeValue: string): string {
  const safeDate = dateValue || todayISO();
  const safeTime = /^\d{2}:\d{2}$/.test(timeValue) ? timeValue : toTimeInputValue(new Date());
  return fromDatetimeLocalValue(`${safeDate}T${safeTime}`);
}
