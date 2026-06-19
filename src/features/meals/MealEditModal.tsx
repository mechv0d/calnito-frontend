import { FormEvent, useMemo, useState } from 'react';

import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../lib/timezone';
import type { Meal, MealItemUpdate, MealType, MealUpdateRequest } from '../../types/api';
import { mealTypes, MEAL_TYPE_LABELS } from '../../types/api';
import { ItemsEditor } from './ItemsEditor';

interface MealEditModalProps {
  meal: Meal;
  loading: boolean;
  onClose: () => void;
  onSave: (mealId: string, payload: MealUpdateRequest) => Promise<void>;
}

export function MealEditModal({ meal, loading, onClose, onSave }: MealEditModalProps) {
  const [description, setDescription] = useState(meal.description);
  const [mealType, setMealType] = useState<MealType>(meal.meal_type);
  const [consumedAt, setConsumedAt] = useState(toDatetimeLocalValue(meal.consumed_at));
  const [items, setItems] = useState<MealItemUpdate[]>(
    meal.items.map((item) => ({
      product_name: item.product_name,
      portion_g: item.portion_g,
      kcal_per_100g: item.kcal_per_100g,
      confidence: item.confidence,
    })),
  );

  const manualTimeAllowed = mealType === 'snacks';
  const totalCalories = useMemo(
    () => items.reduce((sum, item) => sum + (item.portion_g * item.kcal_per_100g) / 100, 0),
    [items],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload: MealUpdateRequest = {
      description: description.trim(),
      meal_type: mealType,
      items,
    };
    if (manualTimeAllowed) {
      payload.consumed_at = fromDatetimeLocalValue(consumedAt);
    }
    await onSave(meal.id, payload);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Редактирование еды" onMouseDown={(e) => e.stopPropagation()}>
        <form className="form" onSubmit={handleSubmit}>
          <div className="panel__title-row">
            <div>
              <h2>Редактировать прием пищи</h2>
              <p className="muted">Итого после правки: {Math.round(totalCalories)} ккал</p>
            </div>
            <button className="button button--ghost" type="button" onClick={onClose}>Закрыть</button>
          </div>

          <label>
            Описание
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
          </label>

          <div className="form-grid form-grid--two">
            <label>
              Тип приема
              <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
                {mealTypes.map((type) => (
                  <option value={type} key={type}>{MEAL_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </label>

            {manualTimeAllowed ? (
              <label>
                Время приема
                <input
                  type="datetime-local"
                  value={consumedAt}
                  onChange={(e) => setConsumedAt(e.target.value)}
                />
              </label>
            ) : null}
          </div>

          <ItemsEditor items={items} onChange={setItems} showConfidence={false} />

          <div className="modal-actions">
            <button className="button button--ghost" type="button" onClick={onClose}>Отмена</button>
            <button className="button button--primary" disabled={loading}>{loading ? 'Сохраняем...' : 'Сохранить'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
