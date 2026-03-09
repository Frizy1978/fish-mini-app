'use client';

import { AlertCircle, ArrowLeft, ShoppingBasket, Trash2 } from 'lucide-react';

import {
  formatCurrency,
  type BatchSummary,
  type CartPreview,
  type Product,
  type UserProfile
} from '@fominiapp/shared';

import { getDisplayProductImage } from '../../lib/storefront-display';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Panel } from '../ui/panel';
import { SectionHeading } from '../ui/section-heading';
import { Textarea } from '../ui/textarea';

export function CartPanel({
  products,
  preview,
  batch,
  profile,
  requestComment,
  checkoutMode,
  submitting,
  onRequestCommentChange,
  onProfileChange,
  onCheckout,
  onBack,
  onSubmit,
  onUpdateQty,
  onRemove
}: {
  products: Product[];
  preview: CartPreview;
  batch: BatchSummary;
  profile: UserProfile;
  requestComment: string;
  checkoutMode: boolean;
  submitting: boolean;
  onRequestCommentChange: (value: string) => void;
  onProfileChange: (field: keyof UserProfile, value: string) => void;
  onCheckout: () => void;
  onBack: () => void;
  onSubmit: () => void;
  onUpdateQty: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
}) {
  if (!preview.items.length) {
    return (
      <div className='space-y-4'>
        <SectionHeading title='Корзина' subtitle='Добавьте товары из каталога' />
        <Panel className='py-10 text-center'>
          <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-softblue text-brand'>
            <ShoppingBasket className='h-6 w-6' />
          </div>
          <h2 className='mt-4 font-display text-2xl font-bold text-ink'>Корзина пока пуста</h2>
          <p className='mt-2 text-sm leading-6 text-slate-500'>
            Добавьте рыбу или морепродукты. Здесь сразу появится предварительная сумма заказа.
          </p>
        </Panel>
      </div>
    );
  }

  if (checkoutMode) {
    return (
      <div className='space-y-4'>
        <button className='inline-flex items-center gap-2 text-sm text-slate-500' onClick={onBack} type='button'>
          <ArrowLeft className='h-4 w-4' />
          Вернуться к корзине
        </button>

        <SectionHeading title='Подтверждение заказа' subtitle='Проверьте данные перед отправкой' />

        <Panel className='space-y-4'>
          <div className='grid gap-3'>
            <Input placeholder='Имя' value={profile.firstName} onChange={(event) => onProfileChange('firstName', event.target.value)} />
            <Input placeholder='Фамилия' value={profile.lastName ?? ''} onChange={(event) => onProfileChange('lastName', event.target.value)} />
            <Input placeholder='Телефон' value={profile.phone} onChange={(event) => onProfileChange('phone', event.target.value)} />
            <Input placeholder='Город' value={profile.city} onChange={(event) => onProfileChange('city', event.target.value)} />
            <Input placeholder='Точка выдачи' value={profile.pickupPoint} onChange={(event) => onProfileChange('pickupPoint', event.target.value)} />
            <Textarea
              placeholder='Комментарий к заявке'
              value={requestComment}
              onChange={(event) => onRequestCommentChange(event.target.value)}
            />
          </div>
        </Panel>

        <Panel className='space-y-2 bg-softblue/45'>
          <p className='text-sm font-semibold text-ink'>{batch.title}</p>
          <p className='text-sm text-slate-600'>{batch.pickupWindow}</p>
          <p className='text-sm text-slate-600'>{batch.pickupPoint}</p>
        </Panel>

        <Panel className='space-y-4'>
          {preview.items.map((item) => (
            <div key={item.productId} className='flex items-start justify-between gap-4 border-b border-line pb-3 last:border-b-0 last:pb-0'>
              <div>
                <p className='font-accent text-sm font-semibold text-ink'>{item.productName}</p>
                <p className='mt-1 text-xs text-slate-500'>
                  {item.qtyRequested} / {item.unit}
                </p>
              </div>
              <p className='font-accent text-sm font-semibold text-accent'>{formatCurrency(item.estimatedSum)}</p>
            </div>
          ))}
        </Panel>

        <Panel className='space-y-4 bg-mist'>
          <div className='flex items-start gap-3 text-sm text-slate-600'>
            <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-accent' />
            {preview.weightedDisclaimer}
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-slate-500'>Итого предварительно</span>
            <span className='font-accent text-xl font-semibold text-accent'>
              {formatCurrency(preview.estimatedTotal)}
            </span>
          </div>
        </Panel>

        <Button className='w-full' disabled={submitting} onClick={onSubmit}>
          {submitting ? 'Отправляем заявку...' : 'Подтвердить заказ'}
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <SectionHeading title='Корзина' subtitle='Проверьте позиции перед подтверждением' />

      {preview.items.map((item) => {
        const product = products.find((entry) => entry.id === item.productId);

        return (
          <Panel key={item.productId} className='bg-white'>
            <div className='flex gap-4'>
              <div className='flex h-24 w-24 shrink-0 items-center justify-center rounded-[18px] bg-[#f7fbff]'>
                {product ? (
                  <img alt={product.name} className='h-20 w-20 object-contain' src={getDisplayProductImage(product)} />
                ) : null}
              </div>

              <div className='flex-1'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-[11px] uppercase tracking-[0.14em] text-slate-400'>
                      {product?.categoryNames[0] ?? 'Товар'}
                    </p>
                    <p className='mt-1 font-accent text-sm font-semibold text-ink'>{item.productName}</p>
                    <p className='mt-1 text-xs text-slate-500'>
                      {formatCurrency(item.price)} / {item.unit}
                    </p>
                  </div>
                  <button
                    className='flex h-8 w-8 items-center justify-center rounded-full bg-[#fff2f2] text-[#cf5b5b]'
                    onClick={() => onRemove(item.productId)}
                    type='button'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>

                <div className='mt-4 flex items-end justify-between gap-3'>
                  <Input
                    className='max-w-[112px] bg-white'
                    min={product?.isWeighted ? 0.1 : 1}
                    onChange={(event) => onUpdateQty(item.productId, Number(event.target.value))}
                    step={product?.isWeighted ? 0.1 : 1}
                    type='number'
                    value={item.qtyRequested}
                  />
                  <p className='font-accent text-lg font-semibold text-accent'>{formatCurrency(item.estimatedSum)}</p>
                </div>
              </div>
            </div>
          </Panel>
        );
      })}

      <Panel className='bg-mist'>
        <div className='flex items-start gap-3 text-sm text-slate-600'>
          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-accent' />
          {preview.weightedDisclaimer}
        </div>
      </Panel>

      <Panel className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-slate-500'>Итого предварительно</span>
          <span className='font-accent text-2xl font-semibold text-accent'>
            {formatCurrency(preview.estimatedTotal)}
          </span>
        </div>
      </Panel>

      <Button className='w-full' onClick={onCheckout}>
        Подтвердить заказ
      </Button>
    </div>
  );
}
