# Fominiapp

Telegram Mini App РґР»СЏ РјР°РіР°Р·РёРЅР° СЂС‹Р±С‹ Рё РјРѕСЂРµРїСЂРѕРґСѓРєС‚РѕРІ Fish Olha.

РЎС‚РµРє:
- `apps/web`: Next.js 15, React 19, Tailwind CSS
- `apps/api`: Express, TypeScript, Prisma, PostgreSQL
- `packages/shared`: РѕР±С‰РёРµ С‚РёРїС‹, СѓС‚РёР»РёС‚С‹, mock data

## РЎС‚СЂСѓРєС‚СѓСЂР°

```text
.
в”њв”Ђ apps/
в”‚  в”њв”Ђ api/
в”‚  в””в”Ђ web/
в”њв”Ђ packages/
в”‚  в””в”Ђ shared/
в”њв”Ђ docker-compose.yml
в””в”Ђ .env.example
```

## Р‘С‹СЃС‚СЂС‹Р№ СЃС‚Р°СЂС‚

1. РЈСЃС‚Р°РЅРѕРІРёС‚СЊ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё:
```bash
npm install
```

2. РџРѕРґРЅСЏС‚СЊ Postgres:
```bash
docker compose up -d
```

3. РџРѕРґРіРѕС‚РѕРІРёС‚СЊ env:
- СЃРєРѕРїРёСЂРѕРІР°С‚СЊ [`.env.example`](/E:/aiprojects/fominiapp/.env.example) РІ `.env` РєР°Рє РѕР±С‰СѓСЋ РїР°РјСЏС‚РєСѓ;
- СЃРєРѕРїРёСЂРѕРІР°С‚СЊ [`apps/api/.env.example`](/E:/aiprojects/fominiapp/apps/api/.env.example) РІ `apps/api/.env`;
- СЃРєРѕРїРёСЂРѕРІР°С‚СЊ [`apps/web/.env.example`](/E:/aiprojects/fominiapp/apps/web/.env.example) РІ `apps/web/.env.local`.

4. РџРѕРґРіРѕС‚РѕРІРёС‚СЊ Prisma:
```bash
npm run prisma:generate --workspace @fominiapp/api
npm run prisma:migrate --workspace @fominiapp/api
npm run prisma:seed --workspace @fominiapp/api
```

5. Р—Р°РїСѓСЃС‚РёС‚СЊ backend Рё frontend:
```bash
npm run dev --workspace @fominiapp/api
npm run dev --workspace @fominiapp/web
```

## Р Р°Р±РѕС‡РёРµ СЂРµР¶РёРјС‹

### Live СЂРµР¶РёРј

РСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РґР»СЏ СЂРµР°Р»СЊРЅРѕР№ СЂР°Р±РѕС‚С‹ СЃ backend Рё WooCommerce.

`apps/api/.env`:
```env
WOOCOMMERCE_MOCK_MODE=false
WOOCOMMERCE_BASE_URL=https://fisholha.ru
WOOCOMMERCE_CONSUMER_KEY=...
WOOCOMMERCE_CONSUMER_SECRET=...
WOOCOMMERCE_SYNC_INTERVAL_MINUTES=2
TELEGRAM_DEV_MODE=true
```

`apps/web/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_TELEGRAM_DEV_MODE=true
```

Р’Р°Р¶РЅРѕ:
- РµСЃР»Рё `NEXT_PUBLIC_USE_MOCK_API=true`, frontend Р±СѓРґРµС‚ РїРѕРєР°Р·С‹РІР°С‚СЊ mock РєР°С‚РµРіРѕСЂРёРё, mock С‚РѕРІР°СЂС‹ Рё mock РёР·РѕР±СЂР°Р¶РµРЅРёСЏ;
- РµСЃР»Рё `WOOCOMMERCE_MOCK_MODE=true`, backend РЅРµ Р±СѓРґРµС‚ С‚СЏРЅСѓС‚СЊ Р¶РёРІРѕР№ РєР°С‚Р°Р»РѕРі РёР· WooCommerce.

### Mock СЂРµР¶РёРј

РџРѕРґС…РѕРґРёС‚ РґР»СЏ Р°РІС‚РѕРЅРѕРјРЅРѕР№ Р»РѕРєР°Р»СЊРЅРѕР№ СЂР°Р·СЂР°Р±РѕС‚РєРё Р±РµР· live backend flow.

`apps/api/.env`:
```env
WOOCOMMERCE_MOCK_MODE=true
GOOGLE_SHEETS_MOCK_MODE=true
TELEGRAM_DEV_MODE=true
```

`apps/web/.env.local`:
```env
NEXT_PUBLIC_USE_MOCK_API=true
```

## РњРёРЅРёРјР°Р»СЊРЅС‹Р№ С‡РµРє-Р»РёСЃС‚ Р·Р°РїСѓСЃРєР° РІ live СЂРµР¶РёРјРµ

1. РџСЂРѕРІРµСЂРёС‚СЊ `apps/api/.env`:
- `WOOCOMMERCE_MOCK_MODE=false`
- `WOOCOMMERCE_BASE_URL` Р·Р°РїРѕР»РЅРµРЅ
- `WOOCOMMERCE_CONSUMER_KEY` Р·Р°РїРѕР»РЅРµРЅ
- `WOOCOMMERCE_CONSUMER_SECRET` Р·Р°РїРѕР»РЅРµРЅ

2. РџСЂРѕРІРµСЂРёС‚СЊ `apps/web/.env.local`:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`
- `NEXT_PUBLIC_USE_MOCK_API=false`

3. Р—Р°РїСѓСЃС‚РёС‚СЊ РїСЂРёР»РѕР¶РµРЅРёСЏ:
```bash
npm run dev --workspace @fominiapp/api
npm run dev --workspace @fominiapp/web
```

4. РџСЂРѕРІРµСЂРёС‚СЊ API:
```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/catalog/categories
curl http://localhost:4000/api/v1/catalog/products
```

5. РџСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РїРµСЂРµСЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°С‚СЊ РєР°С‚Р°Р»РѕРі:
```bash
curl -X POST http://localhost:4000/api/v1/admin/catalog/sync
```

## Р§С‚Рѕ РїСЂРѕРІРµСЂРёС‚СЊ РїРѕСЃР»Рµ Р·Р°РїСѓСЃРєР°

- hero page РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ РїРµСЂРІРѕР№;
- РєР°С‚Р°Р»РѕРі Р·Р°РіСЂСѓР¶Р°РµС‚ live РєР°С‚РµРіРѕСЂРёРё Рё live С‚РѕРІР°СЂС‹;
- Сѓ РєР°С‚Р°Р»РѕРіР° Р±РµР»С‹Р№ С„РѕРЅ;
- РёР·РѕР±СЂР°Р¶РµРЅРёСЏ С‚РѕРІР°СЂРѕРІ Рё РєР°С‚РµРіРѕСЂРёР№ РїСЂРёС…РѕРґСЏС‚ РЅРµ РёР· mock, Р° РёР· backend/WooCommerce;
- РµРґРёРЅРёС†С‹ РёР·РјРµСЂРµРЅРёСЏ Рё С†РµРЅС‹ РѕС‚РѕР±СЂР°Р¶Р°СЋС‚СЃСЏ РєР°Рє РґР°РЅРЅС‹Рµ РёР· live РєР°С‚Р°Р»РѕРіР°;
- РїРѕРёСЃРє, РєРѕСЂР·РёРЅР°, РїСЂРѕС„РёР»СЊ Рё РёСЃС‚РѕСЂРёСЏ СЂР°Р±РѕС‚Р°СЋС‚ Р±РµР· regressions.

## РџСЂРѕРІРµСЂРєР° РєР°С‡РµСЃС‚РІР°

```bash
npm run typecheck
npm run build
```

## Текст и кодировка

- Все русские UI-строки и документация должны сохраняться в UTF-8 без BOM.
- При правках текстовых файлов с русским текстом нельзя сохранять их в ANSI, CP1251 или другой локальной кодировке.
- После правок текстов нужно проверять UI на mojibake и при необходимости повторно сохранять файл в UTF-8.

## ????? ? ?????????

- ??? ??????? UI-?????? ? ???????????? ?????? ??????????? ? UTF-8 ??? BOM.
- ??? ??????? ????????? ?????? ? ??????? ??????? ?????? ????????? ?? ? ANSI, CP1251 ??? ?????? ????????? ?????????.
- ????? ?????? ??????? ????? ????????? UI ?? mojibake ? ??? ????????????? ???????? ????????? ???? ? UTF-8.
