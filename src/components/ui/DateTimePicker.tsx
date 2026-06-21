import { toDateInputValue, toTimeInputValue, combineLocalDateTime } from '../../lib/timezone';
import { DatePicker } from './DatePicker';

interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (isoValue: string) => void;
}

export function DateTimePicker({ label, value, onChange }: DateTimePickerProps) {
  const dateValue = toDateInputValue(value);
  const timeValue = toTimeInputValue(value);

  return (
    <div className="datetime-control">
      <DatePicker label={label} value={dateValue} onChange={(nextDate) => onChange(combineLocalDateTime(nextDate, timeValue))} />
      <label className="date-control datetime-control__time">
        <span>Время</span>
        <input type="time" value={timeValue} onChange={(event) => onChange(combineLocalDateTime(dateValue, event.target.value))} />
      </label>
    </div>
  );
}
