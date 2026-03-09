# Codex Prompt — Telegram Mini App MVP для магазина рыбы и морепродуктов

Ты senior full-stack engineer и product-minded architect. Нужно сгенерировать MVP-систему **Telegram Mini App + Telegram Bot + Backend API** для сбора **предзаказов без онлайн-оплаты** для постоянных покупателей из удалённого города.

## 1. Формат работы
Сгенерируй **боевой каркас проекта**, пригодный для локального запуска и дальнейшей доработки, а не просто демо-код.

Нужно выдать:
1. структуру проекта;
2. frontend Mini App;
3. backend API;
4. интеграционные слои;
5. модели данных;
6. конфиги;
7. README с инструкцией запуска;
8. .env.example;
9. минимальные seed/mock data;
10. базовые сервисы для будущих интеграций с WooCommerce, Google Sheets и Telegram Bot.

## 2. Бизнес-контекст
Есть реальный магазин рыбы и морепродуктов. Основной магазин работает офлайн. Сайт на **WordPress + WooCommerce** используется как **витрина ассортимента**.

Нужно сделать Telegram Mini App для отдельной группы постоянных покупателей в удалённом городе, где:
- заказы собираются раз в 2 недели или раз в месяц;
- покупатели заранее формируют заявки;
- после окончания периода сбора сотрудники консолидируют спрос;
- при необходимости закупают недостающий товар;
- затем собирают заказы, взвешивают весовые позиции;
- считают итоговую стоимость;
- сотрудник привозит заказы в удалённый город в конкретную точку выдачи;
- покупатели забирают заказ и оплачивают **наличными при получении**.

Важно: это **не классический e-commerce checkout с онлайн-оплатой**.

## 3. Цели MVP
Нужно реализовать MVP со следующим функционалом:
1. Показать витрину товаров из WooCommerce с категориями, поиском и фильтрацией.
2. Позволить покупателю собрать заявку в корзину.
3. Показать рекомендации, новинки и связанные товары.
4. Показать ориентировочную стоимость корзины.
5. Дать пользователю подтвердить корректность заявки или вернуться к редактированию.
6. Сохранить заявку в backend.
7. Подготовить сервис записи в Google Sheets:
   - Таблица 1: заявки по каждому клиенту;
   - Таблица 2: консолидированная потребность по товарам.
8. Подготовить Telegram Bot как канал запуска Mini App и отправки подтверждения заявки.

## 4. Что НЕ делать в MVP
Не реализовывать:
- онлайн-оплату;
- курьерскую доставку по адресу;
- полный кабинет оператора;
- полноценную CRM;
- сложную складскую систему;
- автоматическую оплату или эквайринг;
- сложный AI-агент;
- production-ready авторизацию всех ролей;
- heavy analytics dashboard.

## 5. Архитектура, которую нужно сгенерировать
Нужна архитектура:

`Telegram Bot / Mini App -> Backend API -> WooCommerce + Google Sheets`

### Компоненты:
1. **Frontend Mini App**
   - React + Next.js + TypeScript
   - Tailwind CSS
   - аккуратный современный mobile-first UI
   - готовность к запуску внутри Telegram Mini App

2. **Backend API**
   - Node.js + NestJS или Express + TypeScript
   - REST API
   - PostgreSQL через Prisma ORM
   - модульная архитектура
   - подготовленные сервисы интеграции

3. **Интеграции**
   - WooCommerce API client
   - Google Sheets service client
   - Telegram Bot service wrapper
   - Telegram Mini App auth validation scaffold

4. **Инфраструктурные файлы**
   - docker-compose для postgres
   - .env.example
   - README
   - prisma schema
   - миграции или базовый schema setup

## 6. Основные пользовательские роли
### Покупатель
Может:
- открыть Mini App из Telegram;
- смотреть категории;
- искать товары;
- фильтровать товары;
- открывать карточку товара;
- добавлять в корзину;
- указывать ориентировочный вес/количество;
- оставлять комментарий;
- видеть ориентировочную сумму;
- подтверждать заявку.

### Администратор/оператор
В MVP напрямую интерфейс можно не делать, но backend и модели должны предусматривать:
- управление активным периодом сбора заявок;
- просмотр заявок в БД;
- повторную выгрузку в Google Sheets;
- синхронизацию каталога.

## 7. Основные сущности данных
Нужно реализовать модели Prisma и TypeScript types для следующих сущностей.

### User
Поля:
- id
- telegramUserId
- telegramUsername
- firstName
- lastName
- phone
- city
- pickupPoint
- createdAt
- updatedAt

### Batch
Это период / волна сбора заявок.
Поля:
- id
- batchId
- title
- city
- pickupPoint
- status
- startAt
- endAt
- isActive
- createdAt
- updatedAt

### ProductCache
Локальный кэш товаров из WooCommerce.
Поля:
- id
- wooProductId
- sku
- name
- slug
- categoryIdsJson
- categoryNamesJson
- shortDescription
- fullDescription
- imageUrl
- price
- currency
- unit
- isWeighted
- isNew
- isFeatured
- isActive
- payloadJson
- syncedAt
- createdAt
- updatedAt

### Request
Это предзаказ / заявка клиента.
Поля:
- id
- requestId
- batchId
- userId
- status
- estimatedTotal
- currency
- comment
- itemsJson
- submittedAt
- createdAt
- updatedAt

### RequestItem
Поля:
- id
- requestId
- productId
- productNameSnapshot
- skuSnapshot
- unit
- qtyRequested
- priceSnapshot
- estimatedSum
- itemComment
- isWeighted
- createdAt
- updatedAt

### Outbox / IntegrationJob
Опциональная служебная таблица для безопасной повторной отправки в Google Sheets.

## 8. Статусы
### Batch statuses
- draft
- open
- closed
- archived

### Request statuses
- draft
- submitted
- cancelled

Подготовь расширяемую архитектуру, чтобы позже можно было добавить:
- confirmed
- adjustment_requested
- packed
- ready_for_pickup
- completed

## 9. Требования к frontend Mini App
Нужно сделать **красивый современный интерфейс**, не сухую админку.

### Визуальный стиль
Сделать premium fresh-food / seafood aesthetic:
- clean, modern, premium;
- mobile-first;
- мягкие rounded corners (2xl и 3xl);
- карточки с мягкими тенями;
- достаточные отступы;
- выразительная типографика;
- аккуратные бейджи;
- хороший визуальный ритм;
- дизайн должен ощущаться как качественный consumer food app, а не как шаблонная CRM.

### Стиль UI
Использовать:
- React
- Tailwind
- shadcn/ui для базовых компонентов
- lucide-react для иконок
- framer-motion для лёгкой анимации
- без перегруженности
- без кислотных цветов
- без старомодных таблиц в клиентском UI

### Обязательные UX-принципы
- очень удобно на телефоне;
- крупные touch targets;
- простая навигация;
- быстрый доступ к корзине;
- минимальное число шагов до подтверждения заявки;
- понятное разделение: ориентировочная цена vs финальная цена после взвешивания;
- обязательно показать, что оплата наличными при выдаче.

### Основные экраны Mini App
Нужно реализовать:
1. Splash / loading
2. Главная
3. Каталог категорий
4. Список товаров
5. Карточка товара
6. Поиск
7. Корзина
8. Подтверждение заявки
9. Экран успеха
10. Профиль / данные покупателя
11. Экран “приём заявок закрыт”
12. Пустые и error states

### Навигация
Сделать нижнюю mobile nav:
- Главная
- Каталог
- Корзина
- Профиль

### Главная страница должна содержать
- информблок о текущем сборе заявок;
- дату/период выдачи;
- место выдачи;
- строку поиска;
- категории;
- блок “Новинки”;
- блок “Рекомендуем”.

### Список товаров
Должен поддерживать:
- фильтрацию по категориям;
- поиск;
- карточки товаров;
- быстрый add to cart;
- бейджи:
  - Новинка
  - Рекомендуем
  - Весовой товар

### Карточка товара
Должна содержать:
- фото;
- название;
- категорию;
- цену;
- единицу измерения;
- описание;
- поле количества или веса;
- комментарий к позиции;
- блок “С этим товаром берут”.

### Корзина
Должна содержать:
- позиции заказа;
- количество / вес;
- комментарии к позиции;
- ориентировочную стоимость по позиции;
- общую ориентировочную сумму;
- предупреждение, что финальная стоимость может измениться после взвешивания;
- общий комментарий к заявке;
- CTA на подтверждение.

### Экран подтверждения заявки
Поля:
- имя;
- телефон;
- город;
- место выдачи;
- состав заявки;
- ориентировочная сумма;
- информация о batch;
- напоминание об оплате наличными;
- кнопка отправки заявки.

### Экран успеха
Показывает:
- requestId;
- сообщение, что заявка принята;
- напоминание, что итоговая сумма уточняется после сборки;
- оплата наличными при получении.

## 10. Функциональные требования frontend
Сделать:
- mock data слой для локального запуска;
- сервисный слой API client;
- state management для корзины;
- typed DTO models;
- reusable UI components;
- loading states;
- empty states;
- basic validation.

Сделать код чистым и читаемым:
- декомпозиция на компоненты;
- no monolithic page.tsx on 1000+ lines;
- понятная структура папок;
- кастомные hooks;
- util functions;
- constants;
- feature-based layout или аккуратная layered architecture.

## 11. Требования к backend
Сгенерируй backend API с модулями:

### Auth module
- endpoint для валидации Telegram Mini App initData
- create/update user profile
- session scaffold или JWT scaffold
- пока можно сделать dev-mode fallback user для локального запуска

### Batch module
- получить активный batch
- админский endpoint переключения активного batch

### Catalog module
- получить категории
- получить список товаров
- фильтры по категории и поиску
- получить карточку товара
- получить новинки
- получить рекомендуемые
- получить связанные товары

### Cart/Preview module
- принять набор позиций
- пересчитать ориентировочную стоимость
- вернуть normalized preview response

### Request module
- создать заявку
- сохранить Request и RequestItem
- привязать к User и Batch
- присвоить requestId
- вернуть response для фронта

### WooCommerce integration module
Нужен клиент и сервис со следующими возможностями:
- fetch categories
- fetch products
- map WooCommerce product -> internal ProductCache
- sync catalog to local DB

Пока можно сделать:
- реальный сервисный scaffold
- mock mode если ключи не заданы

### Google Sheets integration module
Нужен сервис со следующими функциями:
- append customer request row
- upsert consolidated product row
- rebuild consolidated sheet for batch
- mock mode если credentials не заданы

### Telegram Bot module
Нужен базовый scaffold:
- send order submitted message
- build launch mini app button
- config placeholders for bot token

## 12. API endpoints
Сгенерируй REST endpoints примерно такого состава:

### Auth
- POST /api/v1/auth/telegram

### Batch
- GET /api/v1/batch/active
- POST /api/v1/admin/batch/activate
- POST /api/v1/admin/batch/close

### Catalog
- GET /api/v1/catalog/categories
- GET /api/v1/catalog/products
- GET /api/v1/catalog/products/:id
- GET /api/v1/catalog/new
- GET /api/v1/catalog/featured
- GET /api/v1/catalog/products/:id/related

### Cart
- POST /api/v1/cart/preview

### Requests
- POST /api/v1/requests
- GET /api/v1/requests/my

### Admin/Integrations
- POST /api/v1/admin/catalog/sync
- POST /api/v1/admin/sheets/rebuild/:batchId

## 13. Требования к Google Sheets логике
Нужно подготовить модель и сервис под две таблицы.

### Таблица 1: customer requests
Одна строка = одна заявка.
Колонки:
- request_id
- created_at
- batch_id
- telegram_user_id
- telegram_username
- customer_name
- phone
- city
- pickup_point
- order_comment
- items_text
- items_json
- estimated_total
- currency
- status

### Таблица 2: consolidated products
Одна строка = одна товарная позиция в рамках batch.
Колонки:
- batch_id
- product_id
- sku
- product_name
- unit
- ordered_qty_total
- buyers_count
- buyers_list
- estimated_total_sum
- store_available_qty
- need_to_buy
- notes

Сделай abstraction layer, чтобы можно было:
- сначала работать в mock mode;
- затем подключить реальный Google Sheets API.

## 14. Требования к WooCommerce интеграции
Нужно предусмотреть:
- использование WooCommerce REST API;
- загрузку товаров и категорий;
- кэширование в локальную БД;
- ручной sync endpoint;
- graceful fallback на mock products, если WooCommerce недоступен.

Нужно подготовить mapper, который из WooCommerce данных собирает:
- name
- descriptions
- image
- price
- category
- unit
- featured/new flags
- weighted flag

Если unit/isWeighted явно не приходят из WooCommerce — предусмотреть mapper strategy через meta fields или конфиг.

## 15. Telegram Mini App integration requirements
Во frontend:
- подключить Telegram WebApp SDK;
- вызвать ready();
- вызвать expand();
- подготовить helper для чтения initDataUnsafe в dev mode;
- предусмотреть theme sync scaffold.

В backend:
- подготовить валидацию initData по официальной схеме как отдельный сервис/scaffold;
- сделать dev bypass режим для локальной разработки.

## 16. Требования к качеству кода
Код должен быть:
- production-minded;
- типизированный;
- модульный;
- расширяемый;
- без грубых анти-паттернов;
- без giant god files;
- без хардкода, если можно вынести в constants/config;
- с понятными именами;
- с комментариями только там, где они реально нужны.

Нужно добавить:
- DTO
- validators
- service layer
- repository/data access abstraction where needed
- error handling
- logging
- config module

## 17. README
Сгенерируй хороший README, где будет:
1. описание проекта;
2. стек;
3. архитектура;
4. как запустить frontend;
5. как запустить backend;
6. как поднять postgres через docker-compose;
7. как применить prisma;
8. какие env variables нужны;
9. как включать mock mode;
10. как подключать Telegram Mini App URL;
11. как подключать WooCommerce;
12. как подключать Google Sheets.

## 18. .env.example
Подготовь .env.example с переменными примерно такого вида:
- NODE_ENV
- PORT
- DATABASE_URL
- TELEGRAM_BOT_TOKEN
- TELEGRAM_MINI_APP_URL
- TELEGRAM_DEV_MODE
- WOOCOMMERCE_BASE_URL
- WOOCOMMERCE_CONSUMER_KEY
- WOOCOMMERCE_CONSUMER_SECRET
- WOOCOMMERCE_MOCK_MODE
- GOOGLE_SHEETS_SPREADSHEET_ID
- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_PRIVATE_KEY
- GOOGLE_SHEETS_MOCK_MODE
- APP_DEFAULT_CITY
- APP_DEFAULT_PICKUP_POINT

## 19. Seed / mock data
Подготовь mock data для рыбного магазина:
- 8–12 товаров;
- разные категории;
- часть товаров весовые;
- часть товары-новинки;
- часть featured;
- реалистичные цены;
- связанные товары.

## 20. Что должно получиться в итоге
Мне нужен сгенерированный проект, который:
1. локально запускается;
2. показывает красивый Mini App интерфейс;
3. имеет работающий mock flow оформления заявки;
4. сохраняет заявку в БД;
5. имеет scaffolds для WooCommerce, Google Sheets, Telegram;
6. готов к следующему этапу реальной интеграции.

## 21. Порядок генерации
Сгенерируй результат в логичном порядке:
1. структура репозитория;
2. backend;
3. frontend;
4. prisma schema;
5. docker-compose;
6. env example;
7. README.

## 22. Важные ограничения
- Не упрощай всё до игрушечного demo.
- Но и не строй enterprise-monolith сверх меры.
- Делай реалистичный MVP.
- Не используй лишние внешние сервисы, кроме описанных.
- Код должен быть пригоден для запуска и дальнейшего вайбкодинга.
- UI должен выглядеть дорого, современно и аккуратно.
- Все тексты интерфейса — на русском языке.
- Учти mobile-first usage inside Telegram.

## 23. Дополнительно
Если где-то нужен выбор, предпочитай:
- читаемость > микрооптимизация
- расширяемость > хрупкие shortcuts
- хороший UX > формальный минимализм
- чистую модульную структуру > один гигантский файл

Теперь сгенерируй проект полностью по этому заданию.
