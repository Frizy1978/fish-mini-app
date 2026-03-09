# Fominiapp

MVP-система для магазина рыбы и морепродуктов:

- Telegram Mini App на Next.js;
- REST API на Express + TypeScript;
- PostgreSQL + Prisma;
- mock-first интеграции для WooCommerce, Google Sheets и Telegram Bot.

Проект рассчитан на сценарий предзаказов без онлайн-оплаты: покупатель собирает заявку в Mini App, оператор консолидирует спрос, а оплата происходит наличными при выдаче.

## Стек

- `apps/web`: Next.js 15, React 19, Tailwind CSS, framer-motion, lucide-react
- `apps/api`: Express 5, TypeScript, Prisma, PostgreSQL, Zod
- `packages/shared`: общие типы, mock data, утилиты расчета корзины

## Структура

```text
.
├─ apps/
│  ├─ api/            # Backend API, Prisma schema, seed, integration scaffolds
│  └─ web/            # Telegram Mini App frontend
├─ packages/
│  └─ shared/         # Shared DTO, catalog mock data, helpers
├─ docker-compose.yml
└─ .env.example
```

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Поднимите PostgreSQL:

```bash
docker compose up -d
```

3. Подготовьте env:

- Скопируйте [`.env.example`](/E:/aiprojects/fominiapp/.env.example) в `.env` для общей справки.
- Скопируйте [`apps/api/.env.example`](/E:/aiprojects/fominiapp/apps/api/.env.example) в `apps/api/.env`.
- Скопируйте [`apps/web/.env.example`](/E:/aiprojects/fominiapp/apps/web/.env.example) в `apps/web/.env.local`.

4. Сгенерируйте Prisma client, примените схему и загрузите seed:

```bash
npm run prisma:generate --workspace @fominiapp/api
npm run prisma:migrate --workspace @fominiapp/api
npm run prisma:seed --workspace @fominiapp/api
```

5. Запустите оба приложения:

```bash
npm run dev
```

- Mini App: `http://localhost:3000`
- API: `http://localhost:4000`
- Healthcheck API: `http://localhost:4000/health`

## Отдельный запуск

Frontend:

```bash
npm run dev --workspace @fominiapp/web
```

Backend:

```bash
npm run dev --workspace @fominiapp/api
```

## Что реализовано

### Frontend Mini App

- mobile-first UI на русском языке;
- splash screen, главная, каталог, карточка товара, корзина, подтверждение, профиль, success state;
- нижняя навигация;
- поиск и фильтрация по категориям;
- быстрый add-to-cart и расширенная карточка товара;
- state management корзины с сохранением в `localStorage`;
- Telegram WebApp scaffold: `ready()`, `expand()`, `initData`/`initDataUnsafe`.

### Backend API

- `POST /api/v1/auth/telegram`
- `GET /api/v1/auth/me`
- `GET /api/v1/batch/active`
- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/:id`
- `GET /api/v1/catalog/new`
- `GET /api/v1/catalog/featured`
- `GET /api/v1/catalog/products/:id/related`
- `POST /api/v1/cart/preview`
- `POST /api/v1/requests`
- `GET /api/v1/requests/my`
- `POST /api/v1/admin/catalog/sync`
- `POST /api/v1/admin/sheets/rebuild/:batchId`
- `POST /api/v1/admin/batch/activate`
- `POST /api/v1/admin/batch/close`

### Данные и Prisma

Схема включает:

- `User`
- `Batch`
- `ProductCache`
- `Request`
- `RequestItem`
- `IntegrationJob`

Seed добавляет:

- активный batch;
- demo user;
- 12 mock товаров;
- демонстрационную заявку.

## Mock mode

### Frontend mock mode

Если в `apps/web/.env.local` оставить:

```env
NEXT_PUBLIC_USE_MOCK_API=true
```

Mini App будет работать без живого API, используя `packages/shared` и `localStorage`.

### Backend mock mode

Если оставить:

```env
WOOCOMMERCE_MOCK_MODE=true
GOOGLE_SHEETS_MOCK_MODE=true
TELEGRAM_DEV_MODE=true
```

то backend:

- берет каталог из mock data;
- пишет задания интеграций в `IntegrationJob`;
- пропускает строгую Telegram auth-проверку в dev-сценарии.

## Интеграции

### WooCommerce

Файл [`apps/api/src/modules/integrations/woocommerce.service.ts`](/E:/aiprojects/fominiapp/apps/api/src/modules/integrations/woocommerce.service.ts) содержит scaffold для:

- загрузки товаров;
- маппинга WooCommerce product -> `ProductCache`;
- ручной синхронизации каталога.

Для подключения укажите:

- `WOOCOMMERCE_BASE_URL`
- `WOOCOMMERCE_CONSUMER_KEY`
- `WOOCOMMERCE_CONSUMER_SECRET`
- `WOOCOMMERCE_MOCK_MODE=false`

### Google Sheets

Файл [`apps/api/src/modules/integrations/google-sheets.service.ts`](/E:/aiprojects/fominiapp/apps/api/src/modules/integrations/google-sheets.service.ts) подготавливает:

- customer requests sheet row;
- consolidated products sheet rows;
- rebuild по batch.

Сейчас live-ветка оставлена как scaffold, а mock-ветка безопасно пишет задания в `IntegrationJob`.

### Telegram Bot

Файл [`apps/api/src/modules/integrations/telegram-bot.service.ts`](/E:/aiprojects/fominiapp/apps/api/src/modules/integrations/telegram-bot.service.ts) содержит:

- кнопку запуска Mini App;
- отправку подтверждения по заявке;
- mock fallback, если токен бота не задан.

## Telegram Mini App URL

Для Telegram BotFather укажите URL Mini App из `TELEGRAM_MINI_APP_URL`.

Для локальной разработки обычно используют туннель, например через `ngrok` или аналог, после чего:

- обновляют `TELEGRAM_MINI_APP_URL`;
- выключают `NEXT_PUBLIC_USE_MOCK_API`, если нужен живой backend flow;
- передают публичный URL в конфиг бота.

## Проверка качества

После установки зависимостей можно прогнать:

```bash
npm run typecheck
npm run build
```

## Следующий этап

- Подключить реальный Telegram initData validation в production-режиме с обязательным бот-токеном.
- Довести live-ветку Google Sheets до реального API-клиента.
- Добавить административный UI для управления batch и повторных выгрузок.
- Расширить WooCommerce mapping через meta fields для `unit` и `isWeighted`.
