# Frontend API notes

## Auth

Every private request sends:

```http
Authorization: Bearer <firebase-id-token>
X-Timezone: Europe/Helsinki
```

`X-Timezone` is resolved from browser via:

```ts
Intl.DateTimeFormat().resolvedOptions().timeZone
```

## Create meal

```http
POST /v1/meals
Content-Type: multipart/form-data
```

Fields:

```text
description: string
photo?: File
```

## Manual edit

```http
PATCH /v1/meals/{meal_id}
Content-Type: application/json
```

Payload:

```json
{
  "description": "сырники и кофе",
  "meal_type": "breakfast",
  "items": [
    {
      "product_name": "сырники",
      "portion_g": 220,
      "kcal_per_100g": 230,
      "confidence": 1
    }
  ]
}
```

For snacks, frontend can also send `consumed_at` ISO string.

## Signed photo URL

The backend response field is:

```json
{
  "photo": {
    "storage_path": "users/.../photo.webp",
    "signed_url": "https://...",
    "width": 1200,
    "height": 900
  }
}
```

Frontend displays only `photo.signed_url`.
