import { useCallback, useEffect, useMemo, useState } from 'react';

import { getRecommendations } from '../../api/recommendations';
import { createMeal, deleteMeal, getTodaySummary, updateMeal } from '../../api/meals';
import { useToast } from '../../app/providers/ToastProvider';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { HomePageSkeleton, RecommendationSkeleton } from '../../components/ui/Skeleton';
import { MarkdownText } from '../../components/ui/MarkdownText';
import { formatCalories, formatMealType } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';
import type { Meal, MealUpdateRequest, RecommendationResponse, TodaySummaryResponse } from '../../types/api';
import { mealTypes } from '../../types/api';
import { useApi } from '../../hooks/useApi';
import { MealCard } from './MealCard';
import { MealEditModal } from './MealEditModal';
import { MealForm } from './MealForm';

export function HomePage() {
  const api = useApi();
  const { showToast } = useToast();
  const [summary, setSummary] = useState<TodaySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await getTodaySummary(api));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const groupedMeals = useMemo(() => {
    const groups = new Map(mealTypes.map((type) => [type, [] as Meal[]]));
    for (const meal of summary?.meals ?? []) {
      groups.get(meal.meal_type)?.push(meal);
    }
    return groups;
  }, [summary?.meals]);

  const handleCreate = async (description: string, photo: File | null) => {
    setSaving(true);
    try {
      await createMeal(api, { description, photo });
      showToast('Прием пищи добавлен', 'success');
      await load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (mealId: string, payload: MealUpdateRequest) => {
    setSaving(true);
    try {
      await updateMeal(api, mealId, payload);
      setSelectedMeal(null);
      showToast('Прием пищи обновлен', 'success');
      await load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mealId: string) => {
    if (!window.confirm('Удалить прием пищи?')) return;
    try {
      await deleteMeal(api, mealId);
      showToast('Удалено', 'success');
      await load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleRecommendations = async () => {
    setRecommendationLoading(true);
    try {
      setRecommendation(await getRecommendations(api));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setRecommendationLoading(false);
    }
  };

  if (loading) return <HomePageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const formatter = new Intl.DateTimeFormat(navigator.language, {
  dateStyle: 'full'
});

  return (
    <div className="home-page page-stack">
      <header className="home-hero">
        <div className="home-hero__copy">
          <p className="eyebrow">Сегодня · {formatter.format(new Date())}</p>
          <h1>{formatCalories(summary?.total_calories)} за день</h1>
          <p className="muted">Коротко опишите вашу еду или приложите фото с пояснениями.</p>
        </div>

        <MealForm onSubmit={handleCreate} loading={saving} />

        <button className="button button--ghost home-hero__recommendations" onClick={handleRecommendations} disabled={recommendationLoading}>
          {recommendationLoading ? 'Смотрю неделю...' : 'Показать рекомендации'}
        </button>
      </header>

      {recommendationLoading ? <RecommendationSkeleton /> : null}

      {recommendation && !recommendationLoading ? (
        <section className="panel recommendation-panel">
          <div className="panel__title-row">
            <h2>Рекомендации</h2>
            <span className="pill">{recommendation.meals_analyzed} приемов</span>
          </div>
          <MarkdownText className="recommendation-text" text={recommendation.text} />
        </section>
      ) : null}

      <section className="summary-grid">
        {mealTypes.map((type) => (
          <article className={`summary-card meal-type-surface meal-type-surface--${type}`} key={type}>
            <span>{formatMealType(type)}</span>
            <strong>{formatCalories(summary?.by_meal_type?.[type] ?? 0)}</strong>
          </article>
        ))}
      </section>

      <section className="page-stack meals-section">
        <div className="section-heading">
          <h2>Приемы пищи</h2>
          <span className="muted">{summary?.meals_count ?? 0} записей</span>
        </div>

        {summary?.meals?.length ? (
          mealTypes.map((type) => {
            const meals = groupedMeals.get(type) ?? [];
            if (!meals.length) return null;
            return (
              <div className="meal-group" key={type}>
                <h3>{formatMealType(type)}</h3>
                <div className="meal-grid">
                  {meals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onEdit={setSelectedMeal}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState title="Пока ничего не добавлено" description="Опишите прием пищи выше — мы аккуратно разложим его на продукты и калории." />
        )}
      </section>

      {selectedMeal ? (
        <MealEditModal
          meal={selectedMeal}
          loading={saving}
          onClose={() => setSelectedMeal(null)}
          onSave={handleUpdate}
        />
      ) : null}
    </div>
  );
}
