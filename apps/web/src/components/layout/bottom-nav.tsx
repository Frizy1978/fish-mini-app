'use client';

import { Grid2x2, Home, ShoppingBasket, UserRound } from 'lucide-react';

import { cn } from '../../lib/utils';

type TabKey = 'home' | 'catalog' | 'cart' | 'profile';

const items: Array<{ key: TabKey; label: string; icon: typeof Home }> = [
  { key: 'home', label: 'Главная', icon: Home },
  { key: 'catalog', label: 'Каталог', icon: Grid2x2 },
  { key: 'cart', label: 'Корзина', icon: ShoppingBasket },
  { key: 'profile', label: 'Профиль', icon: UserRound }
];

export function BottomNav({
  activeTab,
  cartCount,
  onChange
}: {
  activeTab: TabKey;
  cartCount: number;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <nav className='grid w-full grid-cols-4 border-t border-[#dadada] bg-white px-1 py-2 shadow-[0_-2px_10px_rgba(15,23,42,0.05)]'>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;

        return (
          <button
            key={item.key}
            className={cn(
              'relative flex min-h-[58px] flex-col items-center justify-center gap-1 px-2 text-[11px] font-medium transition',
              isActive ? 'text-brand' : 'text-slate-500'
            )}
            onClick={() => onChange(item.key)}
            type='button'
          >
            <Icon className={cn('h-5 w-5', isActive ? 'text-brand' : 'text-slate-500')} />
            <span>{item.label}</span>
            {item.key === 'cart' && cartCount > 0 ? (
              <span className='absolute right-5 top-1 rounded-full bg-accent px-1.5 text-[10px] text-white'>
                {cartCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
