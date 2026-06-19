# Calnito Frontend

Отдельный frontend-репозиторий для FastAPI backend дневника питания.

## Стек

- React + TypeScript + Vite
- Firebase Web Auth: email/password регистрация и вход
- Backend API через Firebase ID token в `Authorization: Bearer <token>`
- `X-Timezone` автоматически берется из браузера
- Upload фото через `multipart/form-data`
- Signed URLs для приватных фото берутся из backend response `photo.signed_url`

## Быстрый запуск Windows

```powershell
copy .env.example .env.local
npm install
npm run dev
```

Открой:

```text
http://127.0.0.1:5173
```

Backend должен быть запущен отдельно:

```powershell
python -m uvicorn app.main:app --reload
```

## .env.local

Минимум:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/v1
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_DEFAULT_TIMEZONE=Europe/Helsinki
```

Все env-переменные, которые должны попасть во frontend bundle, должны иметь префикс `VITE_`.

## Backend CORS

В backend `.env` для локальной разработки поставь:

```env
CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

## Функции MVP

- Регистрация / вход / выход через Firebase Auth
- Главная страница:
  - добавление еды текстом
  - необязательное фото еды
  - сумма калорий за день
  - суммы по типам приемов пищи
  - список сегодняшних приемов
  - кнопка рекомендаций за неделю
- Ручное редактирование:
  - описание
  - тип приема
  - продукты, вес, ккал/100г, confidence
  - время приема для `snacks`
- Удаление приема пищи
- Страница просмотра еды по дням
- Страница статистики
- Страница настроек профиля и timezone

## API contract

Frontend ожидает backend endpoints:

```text
GET    /v1/users/me
PATCH  /v1/users/me
POST   /v1/meals
GET    /v1/meals/today
GET    /v1/meals/by-day?date=YYYY-MM-DD
GET    /v1/meals?from=YYYY-MM-DD&to=YYYY-MM-DD
PATCH  /v1/meals/{meal_id}
DELETE /v1/meals/{meal_id}
GET    /v1/stats?from=YYYY-MM-DD&to=YYYY-MM-DD
POST   /v1/recommendations
```

## Ошибки

Frontend показывает `detail` из backend как есть. Если ИИ умер и backend вернул:

```json
{ "detail": "Мы проебались, Босс." }
```

пользователь увидит именно это сообщение.

## Тесты

```powershell
npm run test
```

## Production build

```powershell
npm run build
npm run preview
```

## Docker

```powershell
docker build -t calnito-frontend .
docker run --rm -p 8080:80 calnito-frontend
```

## Loading UI

Во всех основных состояниях загрузки используются skeleton screens вместо круглого spinner:

- старт приложения / проверка авторизации;
- главная страница;
- еда по дням;
- статистика;
- настройки;
- блок рекомендаций.

Компоненты находятся в `src/components/ui/Skeleton.tsx`, стили — в `src/styles/global.css` в секции `Skeleton loading states`.
