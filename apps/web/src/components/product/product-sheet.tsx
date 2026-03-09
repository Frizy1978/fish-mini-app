'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatCurrency, type Product } from '@fominiapp/shared';

import { getDisplayProductImage } from '../../lib/storefront-display';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function ProductSheet({
  product,
  onClose,
  onAdd
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (qty: number) => void;
}) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(product?.isWeighted ? 0.5 : 1);
  }, [product]);

  return (
    <AnimatePresence>
      {product ? (
        <motion.div
          animate={{ opacity: 1 }}
          className='fixed inset-0 z-40 bg-slate-950/28 p-4 backdrop-blur-sm'
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ y: 0 }}
            className='mx-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-shell shadow-app'
            exit={{ y: 20 }}
            initial={{ y: 20 }}
            transition={{ duration: 0.22 }}
          >
            <div className='flex items-center justify-between border-b border-line px-5 py-4'>
              <p className='font-accent text-sm font-semibold text-ink'>Карточка товара</p>
              <button
                className='flex h-8 w-8 items-center justify-center rounded-full bg-mist text-slate-500'
                onClick={onClose}
                type='button'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <div className='space-y-5 overflow-y-auto px-5 py-5'>
              <div className='rounded-[24px] bg-white p-5 shadow-soft'>
                <img alt={product.name} className='mx-auto h-52 w-full object-contain' src={getDisplayProductImage(product)} />
              </div>

              <div className='flex flex-wrap gap-2'>
                <Badge className='border-0 bg-brand/10 text-brand'>{product.categoryNames[0]}</Badge>
                {product.isNew ? <Badge className='border-0 bg-brand/10 text-brand'>Новинка</Badge> : null}
                {product.isFeatured ? <Badge className='border-0 bg-accent/10 text-accent'>Хит</Badge> : null}
              </div>

              <div>
                <h2 className='font-display text-[28px] font-bold leading-tight text-ink'>{product.name}</h2>
                <p className='mt-2 font-accent text-lg font-semibold text-accent'>
                  {formatCurrency(product.price)} / {product.unit}
                </p>
                <p className='mt-4 text-sm leading-7 text-slate-600'>{product.fullDescription}</p>
              </div>

              <div className='rounded-[20px] border border-line bg-white p-4'>
                <p className='text-sm font-semibold text-ink'>Количество</p>
                <div className='mt-3 flex items-center gap-3'>
                  <button
                    className='flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink'
                    onClick={() =>
                      setQty((current) =>
                        Math.max(
                          product.isWeighted ? 0.1 : 1,
                          Number((current - (product.isWeighted ? 0.1 : 1)).toFixed(product.isWeighted ? 1 : 0))
                        )
                      )
                    }
                    type='button'
                  >
                    <Minus className='h-4 w-4' />
                  </button>
                  <Input
                    className='text-center text-lg'
                    min={product.isWeighted ? 0.1 : 1}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (Number.isFinite(next) && next > 0) {
                        setQty(next);
                      }
                    }}
                    step={product.isWeighted ? 0.1 : 1}
                    type='number'
                    value={qty}
                  />
                  <button
                    className='flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink'
                    onClick={() =>
                      setQty((current) =>
                        Number((current + (product.isWeighted ? 0.1 : 1)).toFixed(product.isWeighted ? 1 : 0))
                      )
                    }
                    type='button'
                  >
                    <Plus className='h-4 w-4' />
                  </button>
                </div>
                <p className='mt-3 text-xs text-slate-500'>
                  {product.isWeighted
                    ? 'Ориентировочный вес. Финальную сумму уточним после взвешивания.'
                    : 'Количество можно изменить позже в корзине.'}
                </p>
              </div>

              <Button
                className='w-full'
                onClick={() => {
                  onAdd(qty);
                  onClose();
                }}
              >
                Добавить на {formatCurrency(product.price * qty)}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
