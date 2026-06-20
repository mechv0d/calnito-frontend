import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { auth } from '../../lib/firebase';
import { getAuthErrorMessage } from '../../lib/errors';
import { AuthShell } from './AuthShell';
import { VERIFY_EMAIL_RESEND_COOLDOWN_SECONDS, VERIFY_EMAIL_RESEND_COOLDOWN_STORAGE_KEY } from './verifyEmailCooldown';

export function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await sendEmailVerification(credential.user);
        window.localStorage.setItem(
          VERIFY_EMAIL_RESEND_COOLDOWN_STORAGE_KEY,
          String(Date.now() + VERIFY_EMAIL_RESEND_COOLDOWN_SECONDS * 1000),
        );
        showToast('Аккаунт создан. Проверь email для подтверждения', 'success');
      } catch {
        showToast('Аккаунт создан, но письмо подтверждения не отправилось', 'error');
      }
      navigate('/verify-email', { replace: true });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Регистрация" subtitle="Создай аккаунт и начни записывать свою еду.">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
        </label>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button className="button button--primary" disabled={loading}>
          {loading ? 'Создаем...' : 'Создать аккаунт'}
        </button>
        <p className="muted">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </form>
    </AuthShell>
  );
}
