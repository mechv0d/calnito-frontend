import type { ReactNode } from 'react';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__hero">
          <div className="brand__logo brand__logo--large">C</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
