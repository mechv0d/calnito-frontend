import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { auth } from '../../lib/firebase';
import { getErrorMessage } from '../../lib/errors';
import { AuthShell } from './AuthShell';

export function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showToast('Аккаунт создан', 'success');
      navigate('/', { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Регистрация" subtitle="Создай аккаунт и начни записывать еду текстом или фото.">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
        </label>
        <button className="button button--primary" disabled={loading}>
          {loading ? 'Создаем...' : 'Создать аккаунт'}
        </button>
        <p className="muted">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </form>
    </AuthShell>
  );
}
