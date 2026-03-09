'use client';

import type { ReactNode } from 'react';

import { BottomNav } from './bottom-nav';
import { TopNavbar } from './top-navbar';

type TabKey = 'home' | 'catalog' | 'cart' | 'profile';

export function AppShell({
  children,
  activeTab,
  cartCount,
  onTabChange,
  onHomeClick,
  dateLabel,
  timeLabel,
  logoSrc,
  hideBottomNav = false,
  hideTopNav = false
}: {
  children: ReactNode;
  activeTab: TabKey;
  cartCount: number;
  onTabChange: (tab: TabKey) => void;
  onHomeClick: () => void;
  dateLabel: string;
  timeLabel: string;
  logoSrc: string;
  hideBottomNav?: boolean;
  hideTopNav?: boolean;
}) {
  return (
    <div className='min-h-screen'>
      {!hideTopNav ? (
        <TopNavbar dateLabel={dateLabel} logoSrc={logoSrc} onHomeClick={onHomeClick} timeLabel={timeLabel} />
      ) : null}
      <main className={hideTopNav ? 'px-4 py-5' : 'px-4 pb-32 pt-5'}>
        <div className='mx-auto w-full max-w-md'>{children}</div>
      </main>
      {!hideBottomNav ? (
        <div className='fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3'>
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-[#eff7ff] via-[#eff7ff]/92 to-transparent' />
          <div className='pointer-events-auto relative mx-auto max-w-md'>
            <BottomNav activeTab={activeTab} cartCount={cartCount} onChange={onTabChange} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
