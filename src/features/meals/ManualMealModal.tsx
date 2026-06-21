import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { getPopularProducts } from '../../api/meals';
import { DateTimePicker } from '../../components/ui/DateTimePicker';
import { useApi } from '../../hooks/useApi';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../lib/timezone';
import type { ManualMealCreateRequest, MealItemUpdate, MealType, ProductSuggestion } from '../../types/api';
import { mealTypes, MEAL_TYPE_LABELS } from '../../types/api';
import { ItemsEditor } from './ItemsEditor';

interface ManualMealModalProps {
  loading: boolean;
  onClose: () => void;
  onSave: (payload: ManualMealCreateRequest) => Promise<void>;
}

const emptyItem: MealItemUpdate = {
  product_name: '',
  portion_g: 100,
  kcal_per_100g: 100,
  confidence: 1,
};

export function ManualMealModal({ loading, onClose, onSave }: ManualMealModalProps) {
  const api = useApi();
  const [description, setDescription] = useState('Прием пищи');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [consumedAt, setConsumedAt] = useState(toDatetimeLocalValue(new Date()));
  const [items, setItems] = useState<MealItemUpdate[]>([{ ...emptyItem }]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setSuggestionsLoading(true);
    const timeout = window.setTimeout(() => {
      getPopularProducts(api, { query, page, pageSize: 20 })
        .then((response) => {
          if (cancelled) return;
          setSuggestions(response.items ?? []);
          setTotal(response.total ?? 0);
          setHasNext(Boolean(response.has_next));
        })
        .catch(() => {
          if (cancelled) return;
          setSuggestions([]);
          setTotal(0);
          setHasNext(false);
        })
        .finally(() => {
          if (!cancelled) setSuggestionsLoading(false);
        });
    }, 240);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [api, query, page]);

  const totalCalories = useMemo(
    () => items.reduce((sum, item) => sum + (item.portion_g * item.kcal_per_100g) / 100, 0),
    [items],
  );

  const addSuggestion = (suggestion: ProductSuggestion) => {
    const nextItem: MealItemUpdate = {
      product_name: suggestion.product_name,
      portion_g: suggestion.average_portion_g || 100,
      kcal_per_100g: suggestion.kcal_per_100g || 100,
      confidence: 1,
    };

    const hasBlankSingleItem = items.length === 1 && !items[0].product_name.trim();
    setItems(hasBlankSingleItem ? [nextItem] : [...items, nextItem]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSave({
      description: description.trim(),
      meal_type: mealType,
      consumed_at: fromDatetimeLocalValue(consumedAt),
      items: items.map((item) => ({
        ...item,
        product_name: item.product_name.trim(),
      })),
    });
  };

  return createPortal(
    <div className="modal-backdrop modal-backdrop--no-scrollbar" role="presentation" onMouseDown={onClose}>
      <div className="modal modal--meal modal--manual-meal" role="dialog" aria-modal="true" aria-label="Добавить прием пищи вручную" onMouseDown={(event) => event.stopPropagation()}>
        <form className="form" onSubmit={handleSubmit}>
          <div className="panel__title-row">
            <div>
              <h2>Добавить самостоятельно</h2>
              <p className="muted">Итого: {Math.round(totalCalories)} ккал</p>
            </div>
            <button className="button button--ghost" type="button" onClick={onClose}>Закрыть</button>
          </div>

          <label>
            Название приема
            <input value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>

          <div className="form-grid form-grid--two form-grid--meal-meta">
            <label>
              Тип приема
              <select value={mealType} onChange={(event) => setMealType(event.target.value as MealType)}>
                {mealTypes.map((type) => (
                  <option value={type} key={type}>{MEAL_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </label>
            <DateTimePicker label="Дата приема" value={consumedAt} onChange={setConsumedAt} />
          </div>

          <section className="product-picker">
            <div className="panel__title-row">
              <div>
                <h3>Готовые продукты</h3>
                {/* <p className="muted">20 самых популярных, поиск срабатывает автоматически.</p> */}
              </div>
              <span className="pill">{total}</span>
            </div>
            <input placeholder="Найти продукт" value={query} onChange={(event) => setQuery(event.target.value)} />
            <div className="product-picker__list">
              {suggestionsLoading ? <p className="muted">Ищем...</p> : null}
              {!suggestionsLoading && suggestions.length === 0 ? <p className="muted">Готовых продуктов пока нет</p> : null}
              {suggestions.map((suggestion) => (
                <button className="product-suggestion" type="button" key={suggestion.product_name} onClick={() => addSuggestion(suggestion)}>
                  <span>{suggestion.product_name}</span>
                  <small>{Math.round(suggestion.average_portion_g)} г · {Math.round(suggestion.kcal_per_100g)} ккал/100г · ×{suggestion.times_used}</small>
                </button>
              ))}
            </div>
            <div className="product-picker__pager">
              <button className="button button--ghost" type="button" disabled={page <= 1 || suggestionsLoading} onClick={() => setPage((current) => Math.max(current - 1, 1))}>Назад</button>
              <span className="muted">Стр. {page}</span>
              <button className="button button--ghost" type="button" disabled={!hasNext || suggestionsLoading} onClick={() => setPage((current) => current + 1)}>Дальше</button>
            </div>
          </section>

          <ItemsEditor items={items} onChange={setItems} showConfidence={false} />

          <div className="modal-actions">
            <button className="button button--ghost" type="button" onClick={onClose}>Отмена</button>
            <button className="button button--primary" disabled={loading}>{loading ? 'Сохраняем...' : 'Добавить'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
