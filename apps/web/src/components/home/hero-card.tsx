import { CalendarDays, ShoppingBag, Truck } from 'lucide-react';

import type { BatchSummary } from '@fominiapp/shared';

import { getDisplayDateParts } from '../../lib/storefront-display';
import { Button } from '../ui/button';
import { Panel } from '../ui/panel';

export function HeroCard({
  batch,
  heroSrc,
  logoSrc,
  onOpenCatalog
}: {
  batch: BatchSummary;
  heroSrc: string;
  logoSrc: string;
  onOpenCatalog: () => void;
}) {
  const { date, time } = getDisplayDateParts(batch);
  const isOpen = batch.status === 'open';
  const deadlineDate = new Date(batch.endAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <section
      className='relative flex min-h-[100dvh] flex-col justify-between overflow-hidden px-4 py-3'
      style={{
        backgroundImage: `
          linear-gradient(180deg, rgba(239,247,255,0.62) 0%, rgba(252,253,255,0.74) 100%),
          url(${heroSrc})
        `,
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundPosition: 'center top, center 58%',
        backgroundSize: 'cover, min(92vw, 760px)'
      }}
    >
      <div className='space-y-5'>
        <div className='flex flex-col items-center text-center'>
          <img alt='Fish Olha' className='h-16 w-auto object-contain' src={logoSrc} />
          <h1 className='mt-5 font-display text-[18px] font-bold uppercase leading-[1.2] tracking-[0.04em] text-brand'>
            Магазин рыбы и
            <br />
            морепродуктов Fish Olha
          </h1>
        </div>

        <Panel className='rounded-[20px] border-white/70 bg-white/72 px-6 py-5 text-center shadow-soft backdrop-blur-[2px]'>
          <h2 className='text-[18px] font-semibold text-ink'>
            {isOpen ? 'Открыт прием заказов' : 'Прием заказов закрыт'}
          </h2>
          <div className='mt-4 space-y-3 text-left'>
            <div className='flex items-center gap-3 text-sm text-slate-600'>
              <CalendarDays className='h-4 w-4 shrink-0 text-[#59b7c5]' />
              <span>До 20:00, {deadlineDate}</span>
            </div>
            <div className='flex items-center gap-3 text-sm text-slate-600'>
              <ShoppingBag className='h-4 w-4 shrink-0 text-[#59b7c5]' />
              <span>Оплата заказов при получении</span>
            </div>
          </div>
        </Panel>

        <div className='h-[100px]' />

        <Panel className='rounded-[20px] border-white/70 bg-white/78 px-6 py-5 shadow-soft backdrop-blur-[2px]'>
          <p className='text-[18px] font-semibold text-ink'>Оформите заявку заранее.</p>
          <p className='mt-3 text-sm font-medium leading-6 text-slate-600'>
            Финальную сумму уточним после сбора заказа и взвешивания.
          </p>
          <p className='mt-3 text-[16px] font-bold text-ink'>Доставка:</p>
          <div className='mt-3 flex items-center gap-3 text-sm text-slate-600'>
            <Truck className='h-4 w-4 shrink-0 text-[#59b7c5]' />
            <span>
              {date}, {time}
            </span>
          </div>
        </Panel>
      </div>

      <Button className='w-full rounded-[14px]' onClick={onOpenCatalog}>
        Открыть каталог
      </Button>
    </section>
  );
}