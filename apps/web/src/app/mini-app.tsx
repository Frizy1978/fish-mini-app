"use client";

import {
  calculateCartPreview,
  demoUser,
  formatCurrency,
  type BatchSummary,
  type Product,
  type RequestRecord,
  type UserProfile
} from '@fominiapp/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';

import { CartPanel } from '../components/cart/cart-panel';
import { CategoryCarousel } from '../components/catalog/category-carousel';
import { ProductCard } from '../components/catalog/product-card';
import { HeroCard } from '../components/home/hero-card';
import { AppShell } from '../components/layout/app-shell';
import { ProductSheet } from '../components/product/product-sheet';
import { ProfilePanel } from '../components/profile/profile-panel';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Panel } from '../components/ui/panel';
import { SearchField } from '../components/ui/search-field';
import { loadBootPayload, previewCart, submitRequest, type BootPayload } from '../lib/api';
import {
  brandAssets,
  buildDisplayCategories,
  buildNoveltyProducts,
  getDisplayDateParts
} from '../lib/storefront-display';
import { useCart } from '../features/cart/cart-store';
import { useTelegram } from '../features/telegram/use-telegram';

type TabKey = 'home' | 'catalog' | 'cart' | 'profile';

const fallbackBatch: BatchSummary = {
  id: 1,
  batchId: 'LOADING',
  title: 'Прием заявок открыт',
  city: 'Мурманск',
  pickupPoint: 'Точка выдачи уточняется',
  status: 'open',
  startAt: '2026-03-09T00:00:00.000Z',
  endAt: '2026-03-19T20:00:00.000Z',
  pickupWindow: '19 марта, 12:00-20:00',
  isActive: true
};

export function MiniApp() {
  const { items, count, addItem, clear, removeItem, updateItem } = useCart();
  const telegram = useTelegram();

  const [tab, setTab] = useState<TabKey>('home');
  const [boot, setBoot] = useState<BootPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategoryKey, setActiveCategoryKey] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [requestComment, setRequestComment] = useState('');
  const [profile, setProfile] = useState<UserProfile>(demoUser);
  const [preview, setPreview] = useState(calculateCartPreview([], []));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<RequestRecord | null>(null);

  const deferredSearch = useDeferredValue(search);

  async function bootstrap() {
    try {
      setStatus('loading');
      setError(null);
      if (!telegram.isTelegramEnvironment && !telegram.isDevFallback && process.env.NEXT_PUBLIC_USE_MOCK_API === 'false') {
        throw new Error('Откройте приложение из Telegram или включите dev mode');
      }
      const payload = await loadBootPayload(telegram.initData);
      setBoot(payload);
      setProfile(payload.session.user);
      setStatus('ready');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить приложение');
      setStatus('error');
    }
  }

  useEffect(() => {
    void bootstrap();
  }, [telegram.initData, telegram.isDevFallback, telegram.isTelegramEnvironment]);

  useEffect(() => {
    if (!boot) {
      return;
    }

    if (!items.length) {
      setPreview(calculateCartPreview([], boot.products));
      return;
    }

    void previewCart(items, boot.session.token)
      .then(setPreview)
      .catch(() => setPreview(calculateCartPreview(items, boot.products)));
  }, [boot, items]);

  const displayCategories = useMemo(
    () => (boot ? buildDisplayCategories(boot.categories, boot.products) : []),
    [boot]
  );

  useEffect(() => {
    if (!displayCategories.length) {
      return;
    }

    if (activeCategoryKey && !displayCategories.some((category) => category.key === activeCategoryKey)) {
      setActiveCategoryKey('');
    }
  }, [activeCategoryKey, displayCategories]);

  const activeCategory = useMemo(
    () => displayCategories.find((category) => category.key === activeCategoryKey),
    [activeCategoryKey, displayCategories]
  );

  const hasSearch = deferredSearch.trim().length > 0;
  const hasActiveCategoryFilter = Boolean(activeCategoryKey);

  const filteredProducts = useMemo(() => {
    if (!boot) {
      return [];
    }

    const query = deferredSearch.trim().toLowerCase();

    return boot.products.filter((product) => {
      if (!product.isActive) {
        return false;
      }

      const matchesCategory = query ? true : activeCategory ? activeCategory.matches(product) : true;
      const matchesSearch = query
        ? `${product.name} ${product.shortDescription} ${product.sku}`.toLowerCase().includes(query)
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, boot, deferredSearch]);

  const noveltyProducts = useMemo(
    () => (boot ? buildNoveltyProducts(boot.products, boot.fresh) : []),
    [boot]
  );

  useEffect(() => {
    if (!displayCategories.length && !noveltyProducts.length) {
      return;
    }

    const preloadSources = [
      ...displayCategories.slice(0, 4).map((category) => category.imageSrc),
      ...noveltyProducts.slice(0, 8).map((product) => product.imageUrl)
    ];

    preloadSources.forEach((src) => {
      if (!src) {
        return;
      }

      const image = new window.Image();
      image.decoding = 'async';
      image.src = src;
    });
  }, [displayCategories, noveltyProducts]);

  const batchClosed = boot?.batch.status !== 'open';

  const switchTab = (nextTab: TabKey) => {
    startTransition(() => {
      setTab(nextTab);
      if (nextTab !== 'cart') {
        setCheckoutMode(false);
      }
    });
  };

  const handleQuickAdd = (product: Product) => {
    if (batchClosed) {
      return;
    }

    addItem(product.id, product.isWeighted ? 0.5 : 1);
    switchTab('cart');
  };

  const handleSubmit = async () => {
    if (!boot || batchClosed) {
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const created = await submitRequest(
        {
          user: profile,
          batchId: boot.batch.batchId,
          items,
          comment: requestComment
        },
        boot.session.token
      );

      setSubmitted(created);
      clear();
      setCheckoutMode(false);
      setRequestComment('');
      const refreshed = await loadBootPayload(
        telegram.initData,
        boot.session.token
      );
      setBoot(refreshed);
      setTab('profile');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось отправить заявку');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'error') {
    return (
      <div className='min-h-screen px-4 py-10'>
        <div className='mx-auto max-w-md'>
          <Panel className='text-center'>
            <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-softblue text-brand'>
              <AlertTriangle className='h-6 w-6' />
            </div>
            <h1 className='mt-4 font-display text-2xl font-bold text-ink'>
              Не удалось открыть приложение</h1>
            <p className='mt-2 text-sm leading-6 text-slate-500'>Откройте приложение из Telegram или включите dev mode.</p>
            <Button className='mt-5 w-full gap-2' onClick={() => void bootstrap()}>
              <RefreshCcw className='h-4 w-4' />
              Повторить</Button>
          </Panel>
        </div>
      </div>
    );
  }

  const activeBatch = boot?.batch ?? fallbackBatch;
  const { date, time } = getDisplayDateParts(activeBatch);

  const stateBanner = batchClosed ? (
    <Panel className='mb-4 border border-brand/20 bg-softblue/50'>
      <p className='font-accent text-sm font-semibold text-ink'>Прием заявок сейчас закрыт</p>
      <p className='mt-2 text-sm leading-6 text-slate-600'>
        Каталог и история доступны, но отправка новых заявок возобновится с новым batch.</p>
    </Panel>
  ) : null;
  const errorBanner = error && status === 'ready' ? (
    <Panel className='mb-4 border border-[#f4c7c7] bg-[#fff5f5]'>
      <p className='text-sm font-semibold text-[#a23b3b]'>Не удалось завершить действие</p>
      <p className='mt-2 text-sm leading-6 text-[#7f4a4a]'>{error}</p>
    </Panel>
  ) : null;

  if (!boot || tab === 'home') {
    return (
      <>
        <AppShell
          activeTab='home'
          cartCount={count}
          dateLabel={date}
          hideBottomNav
          hideTopNav
          logoSrc={brandAssets.logo}
          onHomeClick={() => switchTab('home')}
          onTabChange={switchTab}
          timeLabel={time}
        >
          <HeroCard
            batch={activeBatch}
            heroSrc={brandAssets.hero}
            logoSrc={brandAssets.logo}
            onOpenCatalog={() => {
              switchTab('catalog');
            }}
          />
        </AppShell>

        <ProductSheet
          canAdd={!batchClosed}
          onAdd={(qty) => {
            if (!selectedProduct) {
              return;
            }

            addItem(selectedProduct.id, qty);
            switchTab('cart');
          }}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />

        <AnimatePresence>
          {submitted ? (
            <motion.div
              animate={{ opacity: 1 }}
              className='fixed inset-0 z-50 flex items-end bg-slate-950/28 p-4 backdrop-blur-sm'
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              <motion.div
                animate={{ y: 0 }}
                className='mx-auto w-full max-w-md rounded-[24px] bg-white p-6 shadow-app'
                exit={{ y: 16 }}
                initial={{ y: 16 }}
              >
                <Badge className='border-0 bg-brand/10 text-brand'>Заявка принята</Badge>
                <h2 className='mt-4 font-display text-[28px] font-bold text-ink'>
                  {submitted.requestId}
                </h2>
                <p className='mt-3 text-sm leading-6 text-slate-500'>
                  Заявка сохранена. Финальную сумму уточним после сборки заказа и взвешивания.
                </p>
                <p className='mt-2 font-accent text-base font-semibold text-accent'>
                  {formatCurrency(submitted.estimatedTotal)}
                </p>
                <Button className='mt-5 w-full' onClick={() => setSubmitted(null)}>
                  Закрыть
                </Button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <AppShell
        activeTab={tab}
        cartCount={count}
        contentClassName={tab === 'catalog' ? 'bg-white' : ''}
        dateLabel={date}
        hideBottomNav={false}
        logoSrc={brandAssets.logo}
        onHomeClick={() => switchTab('home')}
        onTabChange={switchTab}
        timeLabel={time}
      >
        {stateBanner}
        {errorBanner}

        {tab === 'catalog' ? (
          <div className='space-y-5'>
            <SearchField value={search} onChange={setSearch} />

            {displayCategories.length ? (
              <CategoryCarousel
                activeCategoryKey={activeCategory?.key ?? ''}
                categories={displayCategories}
                onSelect={setActiveCategoryKey}
              />
            ) : null}
            {!hasSearch && !hasActiveCategoryFilter ? (
              <section className='space-y-4'>
                <h2 className='text-[24px] font-semibold text-slate-950'>Новинки</h2>
                <div className='grid grid-cols-2 gap-4'>
                  {noveltyProducts.map((product) => (
                    <ProductCard
                      canQuickAdd={!batchClosed}
                      key={product.id}
                      onOpen={() => setSelectedProduct(product)}
                      onQuickAdd={() => handleQuickAdd(product)}
                      product={product}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {hasSearch || hasActiveCategoryFilter ? (
              <section className='space-y-4'>
                <h3 className='text-[22px] font-semibold text-slate-950'>
                  {hasSearch ? 'Результаты поиска' : activeCategory?.title ?? 'Категория'}
                </h3>
                {filteredProducts.length ? (
                  <div className='grid grid-cols-2 gap-4'>
                    {filteredProducts.map((product) => (
                      <ProductCard
                        canQuickAdd={!batchClosed}
                        key={product.id}
                        onOpen={() => setSelectedProduct(product)}
                        onQuickAdd={() => handleQuickAdd(product)}
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  <Panel className='text-center'>
                    <p className='text-lg font-semibold text-ink'>Ничего не найдено</p>
                    <p className='mt-2 text-sm leading-6 text-slate-500'>
                      Попробуйте изменить поисковый запрос или выбрать другую категорию.
                    </p>
                  </Panel>
                )}
              </section>
            ) : null}
          </div>
        ) : null}

        {tab === 'cart' ? (
          <CartPanel
            batch={boot.batch}
            checkoutMode={checkoutMode}
            isBatchOpen={!batchClosed}
            onBack={() => setCheckoutMode(false)}
            onCheckout={() => setCheckoutMode(true)}
            onProfileChange={(field, value) =>
              setProfile((current) => ({ ...current, [field]: value }))
            }
            onRemove={removeItem}
            onRequestCommentChange={setRequestComment}
            onSubmit={() => void handleSubmit()}
            onUpdateQty={(productId, qty) => updateItem(productId, qty)}
            preview={preview}
            products={boot.products}
            profile={profile}
            requestComment={requestComment}
            submitting={submitting}
          />
        ) : null}

        {tab === 'profile' ? (
          <ProfilePanel
            onChange={(field, value) => setProfile((current) => ({ ...current, [field]: value }))}
            profile={profile}
            requests={boot.myRequests}
          />
        ) : null}
      </AppShell>

      <ProductSheet
        canAdd={!batchClosed}
        onAdd={(qty) => {
          if (!selectedProduct) {
            return;
          }

          addItem(selectedProduct.id, qty);
          switchTab('cart');
        }}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />

      <AnimatePresence>
        {submitted ? (
          <motion.div
            animate={{ opacity: 1 }}
            className='fixed inset-0 z-50 flex items-end bg-slate-950/28 p-4 backdrop-blur-sm'
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ y: 0 }}
              className='mx-auto w-full max-w-md rounded-[24px] bg-white p-6 shadow-app'
              exit={{ y: 16 }}
              initial={{ y: 16 }}
            >
              <Badge className='border-0 bg-brand/10 text-brand'>Заявка принята</Badge>
              <h2 className='mt-4 font-display text-[28px] font-bold text-ink'>
                {submitted.requestId}
              </h2>
              <p className='mt-3 text-sm leading-6 text-slate-500'>
                Заявка сохранена. Финальную сумму уточним после сборки заказа и взвешивания.
              </p>
              <p className='mt-2 font-accent text-base font-semibold text-accent'>
                {formatCurrency(submitted.estimatedTotal)}
              </p>
              <Button className='mt-5 w-full' onClick={() => setSubmitted(null)}>
                Закрыть
              </Button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}


