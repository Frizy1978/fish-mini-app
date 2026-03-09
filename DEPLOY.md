# Staging/Public Deploy

## Minimum env for API

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?schema=public
JWT_SECRET=change-me
TELEGRAM_BOT_TOKEN=123456:ABCDEF
TELEGRAM_MINI_APP_URL=https://staging.example.com
TELEGRAM_DEV_MODE=false
WOOCOMMERCE_BASE_URL=https://fisholha.ru
WOOCOMMERCE_CONSUMER_KEY=...
WOOCOMMERCE_CONSUMER_SECRET=...
WOOCOMMERCE_MOCK_MODE=false
WOOCOMMERCE_SYNC_INTERVAL_MINUTES=15
GOOGLE_SHEETS_MOCK_MODE=true
CORS_ALLOWED_ORIGINS=https://staging.example.com,https://www.example.com
TRUST_PROXY=true
```

## Minimum env for Web

```env
NEXT_PUBLIC_API_BASE_URL=https://api-staging.example.com
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_TELEGRAM_DEV_MODE=false
```

## API production commands

```bash
npm run build --workspace @fominiapp/api
npm run start --workspace @fominiapp/api
```

`build` here is a strict TypeScript verification step, and `start` runs the API in non-watch mode via `tsx`.

## Web production commands

```bash
npm run build --workspace @fominiapp/web
npm run start --workspace @fominiapp/web
```

## Checklist

1. Use HTTPS for Mini App and API.
2. Set `JWT_SECRET` to a real production secret.
3. Set `TRUST_PROXY=true` behind Nginx/Cloudflare/Render/Railway-style proxy.
4. Set `CORS_ALLOWED_ORIGINS` explicitly for staging/public domains.
5. Keep `NEXT_PUBLIC_USE_MOCK_API=false` for staging/public.
6. Keep `WOOCOMMERCE_MOCK_MODE=false` for live catalog sync.
7. Run `POST /api/v1/admin/catalog/sync` after first production startup.
