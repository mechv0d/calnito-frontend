type SkeletonProps = {
  className?: string;
  lines?: number;
};

function times(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

export function SkeletonBlock({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonText({ className = '', lines = 1 }: SkeletonProps) {
  return (
    <div className={`skeleton-text ${className}`} aria-hidden="true">
      {times(lines).map((index) => (
        <SkeletonBlock className={`skeleton-text__line skeleton-text__line--${index + 1}`} key={index} />
      ))}
    </div>
  );
}

export function AppBootSkeleton() {
  return (
    <div className="app-boot-skeleton" aria-label="Загружаем приложение">
      <aside className="sidebar skeleton-sidebar">
        <div className="brand">
          <SkeletonBlock className="skeleton-logo" />
          <div className="skeleton-sidebar__brand-copy">
            <SkeletonBlock className="skeleton-line skeleton-line--brand" />
            <SkeletonBlock className="skeleton-line skeleton-line--muted" />
          </div>
        </div>
        <div className="skeleton-nav">
          {times(4).map((index) => <SkeletonBlock className="skeleton-nav__item" key={index} />)}
        </div>
        <div className="skeleton-sidebar__footer">
          <SkeletonBlock className="skeleton-chip" />
          <SkeletonBlock className="skeleton-button-pill" />
        </div>
      </aside>
      <main className="main-content page-stack">
        <HomePageSkeleton />
      </main>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="home-page page-stack skeleton-page" aria-label="Загружаем главную">
      <header className="home-hero skeleton-home-hero">
        <div className="skeleton-home-copy">
          <SkeletonBlock className="skeleton-line skeleton-line--eyebrow" />
          <SkeletonBlock className="skeleton-line skeleton-line--hero-title" />
          <SkeletonBlock className="skeleton-line skeleton-line--hero-subtitle" />
        </div>
        <div className="meal-composer-card skeleton-composer-card">
          <SkeletonBlock className="skeleton-composer-text" />
          <div className="skeleton-composer-footer">
            <SkeletonBlock className="skeleton-button-round" />
            <SkeletonBlock className="skeleton-button-pill skeleton-button-pill--submit" />
          </div>
        </div>
        <SkeletonBlock className="skeleton-button-pill skeleton-button-pill--recommendation" />
      </header>

      <section className="summary-grid">
        {times(6).map((index) => <SkeletonBlock className="summary-card skeleton-summary-card" key={index} />)}
      </section>

      <section className="page-stack meals-section">
        <div className="section-heading">
          <SkeletonBlock className="skeleton-line skeleton-line--section-title" />
          <SkeletonBlock className="skeleton-line skeleton-line--counter" />
        </div>
        <div className="meal-grid">
          {times(3).map((index) => <MealCardSkeleton key={index} />)}
        </div>
      </section>
    </div>
  );
}

export function MealCardSkeleton() {
  return (
    <article className="meal-card skeleton-meal-card" aria-hidden="true">
      <SkeletonBlock className="skeleton-meal-image" />
      <div className="meal-card__content">
        <div className="meal-card__top">
          <SkeletonBlock className="skeleton-line skeleton-line--meal-title" />
          <SkeletonBlock className="skeleton-pill-small" />
        </div>
        <SkeletonText lines={3} />
        <div className="card-actions">
          <SkeletonBlock className="skeleton-button-small" />
          <SkeletonBlock className="skeleton-button-small" />
        </div>
      </div>
    </article>
  );
}

export function DayPageSkeleton() {
  return (
    <div className="page-stack skeleton-page" aria-label="Загружаем еду за день">
      <section className="panel panel__title-row skeleton-day-total">
        <div className="skeleton-panel-copy">
          <SkeletonBlock className="skeleton-line skeleton-line--muted-date" />
          <SkeletonBlock className="skeleton-line skeleton-line--panel-title" />
        </div>
      </section>
      <div className="meal-grid">
        {times(4).map((index) => <MealCardSkeleton key={index} />)}
      </div>
    </div>
  );
}

export function RecommendationSkeleton() {
  return (
    <section className="panel recommendation-panel skeleton-recommendation" aria-label="Готовим рекомендации">
      <div className="panel__title-row">
        <SkeletonBlock className="skeleton-line skeleton-line--section-title" />
        <SkeletonBlock className="skeleton-pill-small" />
      </div>
      <SkeletonText lines={5} />
    </section>
  );
}

export function StatsPageSkeleton() {
  return (
    <div className="page-stack skeleton-page" aria-label="Загружаем статистику">
      <section className="summary-grid summary-grid--four">
        {times(4).map((index) => <SkeletonBlock className="summary-card metric-card skeleton-metric-card" key={index} />)}
      </section>

      <section className="panel">
        <SkeletonBlock className="skeleton-line skeleton-line--section-title" />
        <div className="bar-list skeleton-bar-list">
          {times(7).map((index) => (
            <div className="bar-row" key={index}>
              <SkeletonBlock className="skeleton-line skeleton-line--bar-label" />
              <SkeletonBlock className="skeleton-bar-track" />
              <SkeletonBlock className="skeleton-line skeleton-line--bar-value" />
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <SkeletonBlock className="skeleton-line skeleton-line--section-title" />
        <div className="summary-grid">
          {times(6).map((index) => <SkeletonBlock className="summary-card skeleton-summary-card" key={index} />)}
        </div>
      </section>

      <section className="two-column">
        {times(2).map((index) => (
          <div className="panel" key={index}>
            <SkeletonBlock className="skeleton-line skeleton-line--section-title" />
            <div className="rank-list skeleton-rank-list">
              {times(5).map((rowIndex) => <SkeletonBlock className="skeleton-rank-row" key={rowIndex} />)}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="page-stack skeleton-page" aria-label="Загружаем настройки">
      <header className="page-header">
        <SkeletonBlock className="skeleton-line skeleton-line--eyebrow" />
        <SkeletonBlock className="skeleton-line skeleton-line--settings-title" />
      </header>
      <section className="panel settings-panel production-settings skeleton-settings-panel">
        <div className="settings-card__header">
          <div className="skeleton-panel-copy">
            <SkeletonBlock className="skeleton-line skeleton-line--section-title" />
            <SkeletonBlock className="skeleton-line skeleton-line--hero-subtitle" />
          </div>
          <SkeletonBlock className="skeleton-chip" />
        </div>
        <div className="form">
          <SkeletonBlock className="skeleton-line skeleton-line--field-label" />
          <SkeletonBlock className="skeleton-field" />
          <SkeletonBlock className="skeleton-line skeleton-line--field-hint" />
          <SkeletonBlock className="skeleton-button-pill skeleton-button-pill--settings" />
        </div>
      </section>
    </div>
  );
}
