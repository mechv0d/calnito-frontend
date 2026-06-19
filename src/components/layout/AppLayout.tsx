import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../../app/providers/AuthProvider';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
          </div>
          <button className="button button--ghost" onClick={handleLogout}>Выйти</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
