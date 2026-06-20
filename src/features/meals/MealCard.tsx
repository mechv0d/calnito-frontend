import { useState } from 'react';

import { formatCalories, formatDateTime, formatWeight } from '../../lib/format';
import type { Meal } from '../../types/api';
import { MealTypeBadge } from './MealTypeBadge';
import { ChevronUp } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (mealId: string) => void;
}

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const photoUrl = meal.photo?.signed_url;
  const hasPhoto = Boolean(photoUrl);
  const collapsedItemsCount = hasPhoto ? 1 : 3;
  const hasHiddenItems = meal.items.length > collapsedItemsCount;
  const visibleItems = expanded || !hasHiddenItems ? meal.items : meal.items.slice(0, collapsedItemsCount);

  return (
    <article className={`meal-card${hasPhoto ? ' meal-card--with-photo' : ' meal-card--without-photo'}${expanded ? ' meal-card--expanded' : ''}`}>
      {photoUrl ? (
        <img className="meal-card__image" src={photoUrl} alt={meal.description} loading="lazy" />
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
        <div className={`meal-card__items${expanded ? ' meal-card__items--expanded' : ''}`}>
          <ul className="item-list">
            {visibleItems.map((item, index) => (
              <li key={`${item.product_name}-${index}`}>
                <span>{item.product_name}</span>
                <span>{formatWeight(item.portion_g)}</span>
                <span>{formatCalories(item.calories)}</span>
              </li>
            ))}
          </ul>

          {hasHiddenItems && !expanded ? (
            <button
              className="meal-card__items-fade"
              type="button"
              onClick={() => setExpanded(true)}
              aria-expanded={false}
            >
              Показать ещё
            </button>
          ) : null}

          {hasHiddenItems && expanded ? (
            <button
              className="meal-card__items-collapse"
              type="button"
              onClick={() => setExpanded(false)}
              aria-expanded={true}
            >
              <ChevronUp size={24} />
            </button>
          ) : null}
        </div>
        <div className="card-actions">
          <button className="button button--secondary" onClick={() => onEdit(meal)}>Править</button>
          <button className="button button--danger" onClick={() => onDelete(meal.id)}>Удалить</button>
        </div>
      </div>
    </article>
  );
}
