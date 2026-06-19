import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { auth } from '../../lib/firebase';
import { getErrorMessage } from '../../lib/errors';
import { AuthShell } from './AuthShell';

export function LoginPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const from = (location.state as { from?: Location } | null)?.from?.pathname || '/';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      showToast('Сначала введи email', 'error');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showToast('Письмо для сброса пароля отправлено', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  return (
    <AuthShell title="Вход" subtitle="Авторизуйся через Firebase и веди дневник питания.">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        <button className="button button--primary" disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </button>
        <button className="button button--ghost" type="button" onClick={handleReset}>Сбросить пароль</button>
        <p className="muted">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
      </form>
    </AuthShell>
  );
}
