import { useCallback, useEffect, useMemo, useState } from 'react';

import { getStats } from '../../api/stats';
import { DatePicker } from '../../components/ui/DatePicker';
import { ErrorState } from '../../components/ui/ErrorState';
import { StatsPageSkeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { formatCalories, formatDateShort, formatMealType } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';
import { daysAgoISO, todayISO } from '../../lib/timezone';
import type { StatsResponse } from '../../types/api';
import { mealTypes } from '../../types/api';

export function StatsPage() {
  const api = useApi();
  const [dateFrom, setDateFrom] = useState(daysAgoISO(13));
  const [dateTo, setDateTo] = useState(todayISO());
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getStats(api, dateFrom, dateTo));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [api, dateFrom, dateTo]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxDayCalories = useMemo(() => {
    if (!data) return 1;
    return Math.max(...Object.values(data.calories_by_day ?? {}), 1);
  }, [data]);

  return (
    <div className="page-stack">
      <header className="page-header page-header--split">
        <div>
          <p className="eyebrow">Аналитика</p>
          <h1>Статистика питания</h1>
        </div>
        <div className="filters filters--dates">
          <DatePicker label="С" value={dateFrom} onChange={setDateFrom} />
          <DatePicker label="По" value={dateTo} onChange={setDateTo} />
          <button className="button button--secondary" onClick={load}>Обновить</button>
        </div>
      </header>

      {loading ? <StatsPageSkeleton /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {data && !loading && !error ? (
        <>
          <section className="summary-grid summary-grid--four">
            <article className="summary-card metric-card"><span>Всего</span><strong>{formatCalories(data.totals.calories)}</strong></article>
            <article className="summary-card metric-card"><span>Среднее в день</span><strong>{formatCalories(data.averages.calories_per_day)}</strong></article>
            <article className="summary-card metric-card"><span>Приемов</span><strong>{data.totals.meals_count}</strong></article>
            <article className="summary-card metric-card"><span>Дней</span><strong>{data.totals.days_count}</strong></article>
          </section>

          <section className="panel">
            <h2>Калории по дням</h2>
            <div className="bar-list">
              {Object.entries(data.calories_by_day ?? {}).map(([day, calories]) => (
                <div className="bar-row" key={day}>
                  <span>{formatDateShort(day)}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max((calories / maxDayCalories) * 100, 3)}%` }} /></div>
                  <strong>{formatCalories(calories)}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>По типам приема</h2>
            <div className="summary-grid">
              {mealTypes.map((type) => (
                <article className={`summary-card meal-type-surface meal-type-surface--${type}`} key={type}>
                  <span>{formatMealType(type)}</span>
                  <strong>{formatCalories(data.calories_by_meal_type?.[type] ?? 0)}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="two-column">
            <div className="panel">
              <h2>Частые продукты</h2>
              <ol className="rank-list">
                {(data.top_products_by_frequency ?? []).map(([name, count]) => <li key={name}><span>{name}</span><strong>{count}</strong></li>)}
              </ol>
            </div>
            <div className="panel">
              <h2>Топ по калориям</h2>
              <ol className="rank-list">
                {(data.top_products_by_calories ?? []).map((item) => <li key={item.product_name}><span>{item.product_name}</span><strong>{formatCalories(item.calories)}</strong></li>)}
              </ol>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
