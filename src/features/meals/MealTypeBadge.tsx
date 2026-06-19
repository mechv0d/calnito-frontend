import { formatMealType } from '../../lib/format';
import type { MealType } from '../../types/api';

export function MealTypeBadge({ type }: { type: MealType }) {
  return <span className={`meal-badge meal-badge--${type}`}>{formatMealType(type)}</span>;
}
