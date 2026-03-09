'use client';

import type { DisplayCategory } from '../../lib/storefront-display';
import { cn } from '../../lib/utils';

export function CategoryCarousel({
  categories,
  activeCategoryKey,
  onSelect
}: {
  categories: DisplayCategory[];
  activeCategoryKey: string;
  onSelect: (categoryKey: string) => void;
}) {
  return (
    <section className='relative left-1/2 w-screen -translate-x-1/2'>
      <div className='mx-auto w-full max-w-md px-4'>
        <div className='no-scrollbar flex gap-2 overflow-x-auto pb-1'>
          {categories.map((category) => {
            const isActive = activeCategoryKey === category.key;

            return (
              <button
                key={category.key}
                className='flex h-[106px] min-w-[74px] flex-col items-center justify-start text-center'
                onClick={() => onSelect(category.key)}
                style={{ flex: '0 0 calc((100% - 1.5rem) / 4)' }}
                type='button'
              >
                <div className='flex h-[70px] w-full items-center justify-center overflow-hidden rounded-[6px]'>
                  <img alt={category.title} className='h-auto w-[92%] object-contain' src={category.imageSrc} />
                </div>
                <span className={cn('mt-1 text-[11px] leading-4', isActive ? 'font-semibold text-ink' : 'font-medium text-slate-600')}>
                  {category.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
