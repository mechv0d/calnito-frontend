import { addDaysISO, todayISO } from '../../lib/timezone';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowToday?: boolean;
}

export function DatePicker({ label, value, onChange, allowToday = true }: DatePickerProps) {
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
      {allowToday ? (
        <button className="date-control__today" type="button" onClick={() => onChange(todayISO())}>
          Сегодня
        </button>
      ) : null}
    </label>
  );
}
