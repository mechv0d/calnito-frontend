import { useCallback, useEffect, useState } from 'react';

import { getMealsByDay } from '../../api/meals';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { DayPageSkeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { formatCalories } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';
import { todayISO } from '../../lib/timezone';
import type { DayMealsResponse } from '../../types/api';
import { MealCard } from '../meals/MealCard';

export function DayPage() {
  const api = useApi();
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState<DayMealsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getMealsByDay(api, date));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [api, date]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page-stack">
      <header className="page-header page-header--split">
        <div>
          <p className="eyebrow">История</p>
          <h1>Еда по дням</h1>
        </div>
        <label className="date-picker">
          День
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </header>

      {loading ? <DayPageSkeleton /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {data && !loading && !error ? (
        <>
          <section className="panel panel__title-row">
            <div>
              <p className="muted">{data.date}</p>
              <h2>{formatCalories(data.total_calories)}</h2>
            </div>
          </section>
          {data.meals?.length ? (
            <div className="meal-grid">
              {(data.meals ?? []).map((meal) => (
                <MealCard key={meal.id} meal={meal} onEdit={() => {}} onDelete={() => {}} />
              ))}
            </div>
          ) : (
            <EmptyState title="За этот день записей нет" />
          )}
        </>
      ) : null}
    </div>
  );
}
