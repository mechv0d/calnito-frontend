export const mealTypes = [
  'breakfast',
  'second_breakfast',
  'lunch',
  'afternoon_snack',
  'dinner',
  'snacks',
] as const;

export type MealType = (typeof mealTypes)[number];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Завтрак',
  second_breakfast: 'Ланч',
  lunch: 'Обед',
  afternoon_snack: 'Полдник',
  dinner: 'Ужин',
  snacks: 'Снеки',
};

export interface PhotoInfo {
  storage_path: string | null;
  signed_url: string | null;
  width: number | null;
  height: number | null;
}

export interface MealItem {
  product_name: string;
  portion_g: number;
  kcal_per_100g: number;
  calories: number;
  confidence: number;
}

export interface MealTotals {
  calories: number;
  products_count: number;
  total_weight_g: number;
}

export interface Meal {
  id: string;
  meal_type: MealType;
  meal_type_label: string;
  date_local: string;
  consumed_at: string;
  created_at: string;
  updated_at: string;
  description: string;
  items: MealItem[];
  totals: MealTotals;
  photo: PhotoInfo | null;
}

export interface TodaySummaryResponse {
  date: string;
  total_calories: number;
  by_meal_type: Record<MealType, number>;
  meals_count: number;
  meals: Meal[];
}

export interface DayMealsResponse {
  date: string;
  meals: Meal[];
  total_calories: number;
}

export interface MealsRangeResponse {
  date_from: string;
  date_to: string;
  meals: Meal[];
  total_calories: number;
}

export interface MealItemUpdate {
  product_name: string;
  portion_g: number;
  kcal_per_100g: number;
  confidence: number;
}

export interface MealUpdateRequest {
  description?: string;
  meal_type?: MealType;
  consumed_at?: string;
  items?: MealItemUpdate[];
}

export interface StatsResponse {
  period: {
    date_from: string;
    date_to: string;
  };
  totals: {
    calories: number;
    meals_count: number;
    days_count: number;
    products_count: number;
  };
  averages: {
    calories_per_day: number;
    calories_per_meal: number;
    products_per_meal: number;
    weight_per_meal_g: number;
  };
  calories_by_day: Record<string, number>;
  calories_by_meal_type: Record<MealType, number>;
  top_products_by_frequency: [string, number][];
  top_products_by_calories: Array<{ product_name: string; calories: number }>;
}

export interface RecommendationResponse {
  text: string;
  meals_analyzed: number;
  period: {
    from: string;
    to: string;
  };
}

export interface UserProfileResponse {
  uid: string;
  email: string | null;
  timezone: string | null;
  created_at: string | null;
  updated_at: string | null;
}
