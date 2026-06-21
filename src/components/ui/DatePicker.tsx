import { addDaysISO, todayISO } from '../../lib/timezone';

interface DatePickerQuickAction {
  label: string;
  value: string;
}

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowToday?: boolean;
  quickActions?: DatePickerQuickAction[];
}

export function DatePicker({ label, value, onChange, allowToday = true, quickActions }: DatePickerProps) {
  const today = todayISO();
  const yesterday = addDaysISO(today, -1);
  const beforeYesterday = addDaysISO(today, -2);
  const defaultQuickActions: DatePickerQuickAction[] = allowToday
    ? [
        { label: 'Сегодня', value: today },
        { label: 'Вчера', value: yesterday },
        { label: 'Позавчера', value: beforeYesterday },
      ]
    : [];
  const visibleQuickActions = quickActions ?? defaultQuickActions;

  return (
    <label className="date-control">
      <span>{label}</span>
      <div className="date-control__box">
        <button className="date-control__step" type="button" aria-label="Предыдущий день" onClick={() => onChange(addDaysISO(value, -1))}>
          −
        </button>
        <input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
        <button className="date-control__step" type="button" aria-label="Следующий день" onClick={() => onChange(addDaysISO(value, 1))}>
          +
        </button>
      </div>
      {visibleQuickActions.length > 0 ? (
        <div className="date-control__quick-actions" aria-label="Быстрый выбор даты">
          {visibleQuickActions.map((action) => (
            <button className="date-control__quick" type="button" key={action.label} onClick={() => onChange(action.value)} aria-pressed={value === action.value}>
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}
