import { FormEvent, useCallback, useEffect, useState } from 'react';

import { getMe, updateMe } from '../../api/users';
import { useToast } from '../../app/providers/ToastProvider';
import { ErrorState } from '../../components/ui/ErrorState';
import { SettingsPageSkeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { getErrorMessage } from '../../lib/errors';
import { getBrowserTimezone } from '../../lib/timezone';
import type { UserProfileResponse } from '../../types/api';

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Moscow', label: 'Москва' },
  { value: 'Europe/Helsinki', label: 'Хельсинки' },
  { value: 'Europe/Berlin', label: 'Берлин' },
  { value: 'Europe/London', label: 'Лондон' },
  { value: 'Asia/Barnaul', label: 'Барнаул' },
  { value: 'Asia/Yekaterinburg', label: 'Екатеринбург' },
  { value: 'Asia/Novosibirsk', label: 'Новосибирск' },
  { value: 'Asia/Krasnoyarsk', label: 'Красноярск' },
  { value: 'Asia/Irkutsk', label: 'Иркутск' },
  { value: 'Asia/Vladivostok', label: 'Владивосток' },
  { value: 'Asia/Tbilisi', label: 'Тбилиси' },
  { value: 'Asia/Dubai', label: 'Дубай' },
  { value: 'Asia/Tokyo', label: 'Токио' },
  { value: 'America/New_York', label: 'Нью-Йорк' },
  { value: 'America/Los_Angeles', label: 'Лос-Анджелес' },
];

function getTimezoneValue(profileTimezone: string | null | undefined): string {
  const browserTimezone = getBrowserTimezone();
  const knownValues = new Set(TIMEZONE_OPTIONS.map((item) => item.value));

  if (profileTimezone && knownValues.has(profileTimezone)) return profileTimezone;
  if (knownValues.has(browserTimezone)) return browserTimezone;

  return 'Europe/Moscow';
}

export function SettingsPage() {
  const api = useApi();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [timezone, setTimezone] = useState(getTimezoneValue(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextProfile = await getMe(api);
      setProfile(nextProfile);
      setTimezone(getTimezoneValue(nextProfile.timezone));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMe(api, timezone);
      setProfile(updated);
      showToast('Настройки сохранены', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SettingsPageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="page-stack page-enter">
      <header className="page-header">
        <p className="eyebrow">Профиль</p>
        <h1>Настройки</h1>
      </header>

      <section className="panel settings-panel production-settings">
        <div className="settings-card__header">
          <div>
            <h2>Аккаунт</h2>
            <p className="muted">Основные параметры приложения.</p>
          </div>
          <span className="account-email">{profile?.email || 'Аккаунт'}</span>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Часовой пояс
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} required>
              {TIMEZONE_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>{option.label} · {option.value}</option>
              ))}
            </select>
            <span className="field-hint">Помогает правильно определять дату и тип приема пищи.</span>
          </label>

          <button className="button button--primary settings-submit" disabled={saving}>{saving ? 'Сохраняем...' : 'Сохранить изменения'}</button>
        </form>
      </section>
    </div>
  );
}
