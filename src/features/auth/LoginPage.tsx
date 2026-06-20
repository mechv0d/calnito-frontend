import { signInWithEmailAndPassword } from 'firebase/auth';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../app/providers/AuthProvider';
import { auth } from '../../lib/firebase';
import { getAuthErrorMessage } from '../../lib/errors';
import { AuthShell } from './AuthShell';

export function LoginPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const from = (location.state as { from?: Location } | null)?.from?.pathname || '/';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Вход" subtitle="Авторизуйся и веди дневник питания.">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button className="button button--primary" disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </button>
        <Link className="button button--ghost" to="/reset-password" state={{ email }}>Сбросить пароль</Link>
        <p className="muted">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
      </form>
    </AuthShell>
  );
}
