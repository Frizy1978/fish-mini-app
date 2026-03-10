import { type Product } from '@fominiapp/shared';

import { formatUnitLabel, getDisplayProductImage } from '../../lib/storefront-display';

export function ProductCard({
  product,
  onOpen,
  onQuickAdd,
  canQuickAdd = true
}: {
  product: Product;
  onOpen: () => void;
  onQuickAdd: () => void;
  canQuickAdd?: boolean;
}) {
  return (
    <article className='flex h-full flex-col rounded-[12px] bg-white p-3 shadow-[0_2px_12px_rgba(15,23,42,0.04)]'>
      <button className='text-left' onClick={onOpen} type='button'>
        <div className='flex h-[144px] items-center justify-center rounded-[10px] bg-[#fbfbfb] p-2'>
          <img
            alt={product.name}
            className='h-full w-full object-contain'
            decoding='async'
            loading='lazy'
            src={getDisplayProductImage(product)}
          />
        </div>
      </button>

      <button className='mt-2 text-left' onClick={onOpen} type='button'>
        <p className='text-[11px] font-semibold text-[#3d7db8]'>
          {product.categoryNames[0]}
        </p>
        <h3 className='mt-1 line-clamp-2 min-h-[44px] text-[14px] leading-[1.35] text-slate-800'>
          {product.name}
        </h3>
      </button>

      <div className='mt-2'>
        <p className='text-[12px] font-bold text-[#218b8f]'>
          {product.price} руб./{formatUnitLabel(product.unit)}
        </p>
      </div>

      <button
        className='mt-auto inline-flex min-h-0 w-fit items-center rounded-full bg-[#168a8b] px-3 py-1.5 text-[12px] font-medium text-white disabled:bg-slate-300 disabled:text-white/80'
        disabled={!canQuickAdd}
        onClick={onQuickAdd}
        type='button'
      >
        {canQuickAdd ? '+ В корзину' : 'Сбор закрыт'}
      </button>
    </article>
  );
}
