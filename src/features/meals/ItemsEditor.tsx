import { AddIcon } from '../../components/icons/AddIcon';
import type { MealItemUpdate } from '../../types/api';

interface ItemsEditorProps {
  items: MealItemUpdate[];
  onChange: (items: MealItemUpdate[]) => void;
  showConfidence?: boolean;
}

const emptyItem: MealItemUpdate = {
  product_name: '',
  portion_g: 100,
  kcal_per_100g: 100,
  confidence: 1,
};

export function ItemsEditor({ items, onChange, showConfidence = true }: ItemsEditorProps) {
  const updateItem = (index: number, patch: Partial<MealItemUpdate>) => {
    onChange(items.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    onChange(items.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="items-editor">
      <div className="panel__title-row">
        <h3>Продукты</h3>
        <button className="button button--secondary" type="button" onClick={() => onChange([...items, { ...emptyItem }])}>
          <AddIcon />
          Добавить
        </button>
      </div>
      {items.map((item, index) => (
        <div className={showConfidence ? 'item-editor-row' : 'item-editor-row item-editor-row--compact'} key={index}>
          <label>
            Продукт
            <input value={item.product_name} onChange={(e) => updateItem(index, { product_name: e.target.value })} required />
          </label>
          <label>
            Вес, г
            <input type="number" value={item.portion_g} min={1} max={5000} step="0.1" onChange={(e) => updateItem(index, { portion_g: Number(e.target.value) })} required />
          </label>
          <label>
            ккал/100г
            <input type="number" value={item.kcal_per_100g} min={0} max={1000} step="0.1" onChange={(e) => updateItem(index, { kcal_per_100g: Number(e.target.value) })} required />
          </label>
          {showConfidence ? (
            <label>
              Уверенность
              <input type="number" value={item.confidence} min={0} max={1} step="0.01" onChange={(e) => updateItem(index, { confidence: Number(e.target.value) })} required />
            </label>
          ) : null}
          <button className="button button--danger item-editor-remove" type="button" onClick={() => removeItem(index)} disabled={items.length === 1}>
            <span className="item-editor-remove__desktop" aria-hidden="true">×</span>
            <span className="item-editor-remove__mobile">Удалить</span>
          </button>
        </div>
      ))}
    </div>
  );
}
