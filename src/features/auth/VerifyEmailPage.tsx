import { sendEmailVerification } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { auth } from '../../lib/firebase';
import { AuthShell } from './AuthShell';
import { VERIFY_EMAIL_RESEND_COOLDOWN_SECONDS, VERIFY_EMAIL_RESEND_COOLDOWN_STORAGE_KEY } from './verifyEmailCooldown';

export function VerifyEmailPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [resendAvailableAt, setResendAvailableAt] = useState(() => {
    const savedValue = Number(window.localStorage.getItem(VERIFY_EMAIL_RESEND_COOLDOWN_STORAGE_KEY));
    return Number.isFinite(savedValue) ? savedValue : 0;
  });
  const [now, setNow] = useState(() => Date.now());
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.emailVerified) {
    return <Navigate to="/" replace />;
  }

  const userEmail = user.email || 'твой email';
  const resendSecondsLeft = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));
  const canResend = resendSecondsLeft === 0 && !resending;

  const startResendCooldown = () => {
    const availableAt = Date.now() + VERIFY_EMAIL_RESEND_COOLDOWN_SECONDS * 1000;
    window.localStorage.setItem(VERIFY_EMAIL_RESEND_COOLDOWN_STORAGE_KEY, String(availableAt));
    setResendAvailableAt(availableAt);
    setNow(Date.now());
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResending(true);
    try {
      await sendEmailVerification(user);
      startResendCooldown();
      showToast('Письмо подтверждения отправлено заново', 'success');
    } catch {
      showToast('Не удалось отправить письмо. Попробуй позже', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleBackHome = async () => {
    try {
      await auth.currentUser?.reload();
    } catch {
      showToast('Не удалось проверить статус email. Попробуй еще раз', 'error');
      return;
    }

    if (auth.currentUser?.emailVerified) {
      navigate('/', { replace: true });
      return;
    }

    showToast('Email пока не подтвержден. Проверь письмо и перейди по ссылке', 'error');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      showToast('Не удалось выйти из аккаунта. Попробуй еще раз', 'error');
    }
  };

  return (
    <AuthShell title="Подтверди email" subtitle={`Мы отправили письмо со ссылкой для подтверждения на ${userEmail}. Открой его, чтобы продолжить пользоваться Calnito.`}>
      <div className="verify-email">
        <div className="verify-email__cat" role="img" aria-label="Плейсхолдер картинки котика">
          <span>cat image placeholder</span>
        </div>
        <p className="muted">
          После подтверждения вернись сюда и нажми кнопку ниже. Если письмо не пришло, проверь папку спама.
        </p>
        <div className="verify-email__actions">
          <button className={"button button--secondary" + (resendSecondsLeft > 0 ? " resend-button--inactive" : "")} type="button" onClick={handleResend} disabled={!canResend}>
            {resending
              ? 'Отправляем...'
              : resendSecondsLeft > 0
                ? `${resendSecondsLeft} сек.`
                : 'Отправить заново'}
          </button>
          <button className="button button--primary" type="button" onClick={handleBackHome}>
            Вернуться на главную
          </button>
          <button className="button button--ghost" type="button" onClick={handleLogout}>
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
