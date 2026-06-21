import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { getRecommendationLimits } from '../../api/recommendations';
import { useAuth } from '../../app/providers/AuthProvider';
import { useApi } from '../../hooks/useApi';
import type { RecommendationLimitResponse } from '../../types/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function AppLayout() {
  const { user, logout } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const [limits, setLimits] = useState<RecommendationLimitResponse | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const loadLimits = useCallback(async () => {
    try {
      setLimits(await getRecommendationLimits(api));
    } catch {
      setLimits(null);
    }
  }, [api]);

  useEffect(() => {
    void loadLimits();
    window.addEventListener('calnito:recommendation-limit-updated', loadLimits);
    return () => window.removeEventListener('calnito:recommendation-limit-updated', loadLimits);
  }, [loadLimits]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setLogoutLoading(false);
      setLogoutConfirmOpen(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__logo">C</div>
          <div>
            <strong>{import.meta.env.VITE_APP_NAME || 'Calnito'}</strong>
            <span>еда без самообмана</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end>Главная</NavLink>
          <NavLink to="/day">По дням</NavLink>
          <NavLink to="/stats">Статистика</NavLink>
          <NavLink to="/settings">Настройки</NavLink>
        </nav>

        <div className="sidebar__footer">
          <div className="user-chip">
            <span>{user?.email || 'Пользователь'}</span>
            {limits ? (
              <small>Рекомендации: {limits.remaining}/{limits.limit} на неделю</small>
            ) : null}
          </div>
          <button className="button button--ghost" onClick={() => setLogoutConfirmOpen(true)}>Выйти</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>

      {logoutConfirmOpen ? (
        <ConfirmDialog
          title="Выйти из аккаунта?"
          description="Вы сможете снова войти по email и паролю."
          confirmText="Выйти"
          cancelText="Остаться"
          danger
          loading={logoutLoading}
          onConfirm={handleLogout}
          onCancel={() => setLogoutConfirmOpen(false)}
        />
      ) : null}
    </div>
  );
}
