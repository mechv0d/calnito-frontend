import { sendPasswordResetEmail } from 'firebase/auth';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { getErrorMessage } from '../../lib/errors';
import { auth } from '../../lib/firebase';
import { AuthShell } from './AuthShell';

export function ResetPasswordPage() {
  const { user } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();
  const initialEmail = (location.state as { email?: string } | null)?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showToast('Письмо для сброса пароля отправлено', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Сброс пароля" subtitle="Введи email, и мы отправим ссылку для восстановления доступа.">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <button className="button button--primary" disabled={loading}>
          {loading ? 'Отправляем...' : 'Отправить ссылку'}
        </button>
        <p className="muted">Вспомнили пароль? <Link to="/login">Вернуться ко входу</Link></p>
      </form>
    </AuthShell>
  );
}
