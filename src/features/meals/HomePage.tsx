import { useCallback, useEffect, useMemo, useState } from 'react';

import { getNextMealRecommendation, getRecommendations } from '../../api/recommendations';
import { createManualMeal, createMeal, deleteMeal, getMealsByDay, getTodaySummary, updateMeal } from '../../api/meals';
import { useToast } from '../../app/providers/ToastProvider';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { HomePageSkeleton, RecommendationSkeleton } from '../../components/ui/Skeleton';
import { MarkdownText } from '../../components/ui/MarkdownText';
import { formatCalories, formatMealType } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';
import { yesterdayISO } from '../../lib/timezone';
import type { DayMealsResponse, ManualMealCreateRequest, Meal, MealType, MealUpdateRequest, RecommendationResponse, TodaySummaryResponse } from '../../types/api';
import { MEAL_TYPE_LABELS, mealTypes } from '../../types/api';
import { useApi } from '../../hooks/useApi';
import { MealCard } from './MealCard';
import { MealEditModal } from './MealEditModal';
import { MealForm } from './MealForm';
import { ManualMealModal } from './ManualMealModal';

type RecommendationAction = 'general' | 'next_meal';

function getNextMealTypeForLabel(date = new Date()): MealType {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < 10 * 60 + 30) return 'breakfast';
  if (minutes < 12 * 60) return 'second_breakfast';
  if (minutes < 15 * 60 + 30) return 'lunch';
  if (minutes < 17 * 60 + 30) return 'afternoon_snack';
  if (minutes < 22 * 60 + 30) return 'dinner';
  return 'breakfast';
}

function groupMeals(meals: Meal[]) {
  const groups = new Map(mealTypes.map((type) => [type, [] as Meal[]]));
  for (const meal of meals) {
    groups.get(meal.meal_type)?.push(meal);
  }
  return groups;
}

export function HomePage() {
  const api = useApi();
  const { showToast } = useToast();
  const [summary, setSummary] = useState<TodaySummaryResponse | null>(null);
  const [previousDay, setPreviousDay] = useState<DayMealsResponse | null>(null);
  const [previousDayVisible, setPreviousDayVisible] = useState(false);
  const [previousDayLoading, setPreviousDayLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [recommendationLoading, setRecommendationLoading] = useState<RecommendationAction | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = await getTodaySummary(api);
      setSummary(today);
      if (previousDayVisible) {
        setPreviousDay(await getMealsByDay(api, yesterdayISO()));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [api, previousDayVisible]);

  useEffect(() => {
    void load();
  }, [load]);

  const groupedMeals = useMemo(() => groupMeals(summary?.meals ?? []), [summary?.meals]);
  const previousGroupedMeals = useMemo(() => groupMeals(previousDay?.meals ?? []), [previousDay?.meals]);
  const nextMealLabel = MEAL_TYPE_LABELS[getNextMealTypeForLabel()].toLowerCase();

  const handleCreate = async (description: string, photos: File[]) => {
    setSaving(true);
    try {
      await createMeal(api, { description, photo: photos[0] ?? null, photos });
      showToast('Прием пищи добавлен', 'success');
      await load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateManual = async (payload: ManualMealCreateRequest) => {
    setSaving(true);
    try {
      await createManualMeal(api, payload);
      setManualModalOpen(false);
      showToast('Прием пищи добавлен вручную', 'success');
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

  const pushRecommendation = (response: RecommendationResponse, fallbackTitle: string) => {
    setRecommendations((current) => [
      {
        ...response,
        title: response.title || fallbackTitle,
      },
      ...current,
    ].slice(0, 4));
    if (response.limit) {
      window.dispatchEvent(new Event('calnito:recommendation-limit-updated'));
    }
  };

  const handleRecommendation = async (kind: RecommendationAction) => {
    setRecommendationLoading(kind);
    try {
      if (kind === 'general') {
        pushRecommendation(await getRecommendations(api), 'Общая рекомендация');
      } else {
        pushRecommendation(await getNextMealRecommendation(api), `Что мне съесть на ${nextMealLabel}`);
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setRecommendationLoading(null);
    }
  };

  const handleLoadPreviousDay = async () => {
    setPreviousDayLoading(true);
    try {
      const data = await getMealsByDay(api, yesterdayISO());
      setPreviousDay(data);
      setPreviousDayVisible(true);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setPreviousDayLoading(false);
    }
  };

  if (loading) return <HomePageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const formatter = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: 'full',
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

        

        <div className="recommendation-actions">
          <button className="button button--ghost home-hero__recommendations" onClick={() => handleRecommendation('general')} disabled={recommendationLoading !== null}>
            {recommendationLoading === 'general' ? 'Собираем данные...' : 'Общая рекомендация'}
          </button>
          <button className="button button--ghost home-hero__recommendations" onClick={() => handleRecommendation('next_meal')} disabled={recommendationLoading !== null}>
            {recommendationLoading === 'next_meal' ? 'Думаем...' : `Что мне съесть на ${nextMealLabel}`}
          </button>
        </div>

        <div className="manual-entry-cta">
          <span>Или</span>
          <button className="button button--primary" type="button" onClick={() => setManualModalOpen(true)}>
            Добавить самостоятельно
          </button>
        </div>
      </header>

      {recommendationLoading ? <RecommendationSkeleton /> : null}

      {recommendations.map((recommendation, index) => (
        <section className="panel recommendation-panel" key={`${recommendation.kind ?? 'general'}-${index}-${recommendation.period?.to ?? ''}`}>
          <div className="panel__title-row">
            <h2>{recommendation.title || 'Рекомендации'}</h2>
            <div className="recommendation-panel__badges">
              {recommendation.limit ? <span className="pill">Осталось {recommendation.limit.remaining}/{recommendation.limit.limit}</span> : null}
              <span className="pill">{recommendation.meals_analyzed} приемов</span>
            </div>
          </div>
          <MarkdownText className="recommendation-text" text={recommendation.text} />
        </section>
      ))}

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

      {previousDayVisible && previousDay ? (
        <section className="page-stack meals-section previous-day-section">
          <div className="section-heading">
            <h2>Предыдущий день</h2>
            <span className="muted">{previousDay.date} · {formatCalories(previousDay.total_calories)}</span>
          </div>
          {previousDay.meals.length ? (
            mealTypes.map((type) => {
              const meals = previousGroupedMeals.get(type) ?? [];
              if (!meals.length) return null;
              return (
                <div className="meal-group" key={`previous-${type}`}>
                  <h3>{formatMealType(type)}</h3>
                  <div className="meal-grid">
                    {meals.map((meal) => (
                      <MealCard key={meal.id} meal={meal} onEdit={setSelectedMeal} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState title="За предыдущий день записей нет" />
          )}
        </section>
      ) : (
        <section className="load-previous-day">
          <button className="button button--secondary" type="button" onClick={handleLoadPreviousDay} disabled={previousDayLoading}>
            {previousDayLoading ? 'Загружаем...' : 'Загрузить предыдущий день'}
          </button>
        </section>
      )}

      {selectedMeal ? (
        <MealEditModal
          meal={selectedMeal}
          loading={saving}
          onClose={() => setSelectedMeal(null)}
          onSave={handleUpdate}
        />
      ) : null}

      {manualModalOpen ? (
        <ManualMealModal
          loading={saving}
          onClose={() => setManualModalOpen(false)}
          onSave={handleCreateManual}
        />
      ) : null}
    </div>
  );
}
