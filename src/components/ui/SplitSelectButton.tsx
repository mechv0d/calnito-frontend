import { useEffect, useId, useMemo, useRef, useState } from 'react';

type SplitSelectButtonOption<T extends string> = {
  value: T;
  label: string;
};

type SplitSelectButtonProps<T extends string> = {
  value: T;
  options: SplitSelectButtonOption<T>[];
  actionLabel: string;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  className?: string;
  menuAriaLabel?: string;
  onChange: (value: T) => void;
  onAction: () => void;
};

export function SplitSelectButton<T extends string>({
  value,
  options,
  actionLabel,
  loading = false,
  loadingLabel = 'Загрузка...',
  disabled = false,
  className = '',
  menuAriaLabel = 'Выбрать вариант',
  onChange,
  onAction,
}: SplitSelectButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState<T>(value);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === localValue) ?? options.find((option) => option.value === value) ?? options[0],
    [localValue, options, value],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const handleSelect = (nextValue: T) => {
    setLocalValue(nextValue);
    onChange(nextValue);
    setOpen(false);
  };

  const rootClassName = [
    'split-select-button',
    open ? 'split-select-button--open' : '',
    disabled ? 'split-select-button--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName} ref={rootRef}>
      <button
        className="split-select-button__action"
        type="button"
        onClick={onAction}
        disabled={disabled}
      >
        <span>{loading ? loadingLabel : actionLabel}</span>
      </button>

      <button
        className="split-select-button__toggle"
        type="button"
        aria-label={menuAriaLabel}
        aria-controls={menuId}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
      >
        <span className="split-select-button__selected">{selectedOption?.label}</span>
        <svg className="split-select-button__chevron" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open ? (
        <div className="split-select-button__menu" id={menuId} role="listbox" aria-label={menuAriaLabel}>
          {options.map((option) => (
            <button
              className="split-select-button__option"
              type="button"
              role="option"
              aria-selected={option.value === localValue}
              key={option.value}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleSelect(option.value);
              }}
            >
              <span>{option.label}</span>
              {option.value === localValue ? <span className="split-select-button__check">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
