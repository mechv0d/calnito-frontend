import { formatCalories, formatDateTime, formatWeight } from '../../lib/format';
import type { Meal } from '../../types/api';
import { MealTypeBadge } from './MealTypeBadge';

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (mealId: string) => void;
}

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  return (
    <article className="meal-card">
      {meal.photo?.signed_url ? (
        <img className="meal-card__image" src={meal.photo.signed_url} alt={meal.description} loading="lazy" />
      ) : null}
      <div className="meal-card__content">
        <div className="meal-card__top">
          <MealTypeBadge type={meal.meal_type} />
          <span className="muted">{formatDateTime(meal.consumed_at)}</span>
        </div>
        <h4>{meal.description}</h4>
        <div className="meal-card__totals">
          <strong>{formatCalories(meal.totals.calories)}</strong>
          <span>{formatWeight(meal.totals.total_weight_g)}</span>
          <span>{meal.totals.products_count} продуктов</span>
        </div>
        <ul className="item-list">
          {meal.items.map((item, index) => (
            <li key={`${item.product_name}-${index}`}>
              <span>{item.product_name}</span>
              <span>{formatWeight(item.portion_g)}</span>
              <span>{formatCalories(item.calories)}</span>
            </li>
          ))}
        </ul>
        <div className="card-actions">
          <button className="button button--secondary" onClick={() => onEdit(meal)}>Править</button>
          <button className="button button--danger" onClick={() => onDelete(meal.id)}>Удалить</button>
        </div>
      </div>
    </article>
  );
}
