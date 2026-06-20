export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Неизвестная ошибка';
}

export function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code) : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Неверный email или пароль. Проверь данные и попробуй ещё раз.';
    case 'auth/invalid-email':
      return 'Похоже, email введён некорректно.';
    case 'auth/email-already-in-use':
      return 'Аккаунт с таким email уже существует.';
    case 'auth/weak-password':
      return 'Пароль слишком слабый. Используй минимум 6 символов.';
    case 'auth/too-many-requests':
      return 'Слишком много попыток. Подожди немного и попробуй снова.';
    case 'auth/network-request-failed':
      return 'Не удалось подключиться к серверу. Проверь интернет и попробуй ещё раз.';
    case 'auth/operation-not-allowed':
      return 'Вход по email и паролю сейчас недоступен. Попробуй позже.';
    case 'auth/user-disabled':
      return 'Этот аккаунт отключён. Если это ошибка, напиши в поддержку.';
    default:
      return 'Что-то пошло не так. Проверь данные и попробуй ещё раз.';
  }
}
