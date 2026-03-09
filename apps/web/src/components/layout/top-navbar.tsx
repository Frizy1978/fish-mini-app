'use client';

import { Package } from 'lucide-react';

type TopNavbarProps = {
  dateLabel: string;
  timeLabel: string;
  logoSrc: string;
  onHomeClick: () => void;
};

export function TopNavbar({ logoSrc, onHomeClick }: TopNavbarProps) {
  return (
    <header className='sticky top-0 z-30 border-b border-[#d8d8d8] bg-[#f4f4f5] shadow-[0_1px_4px_rgba(15,23,42,0.08)]'>
      <div className='mx-auto flex w-full max-w-md items-center justify-between px-4 py-3'>
        <button className='shrink-0' onClick={onHomeClick} type='button'>
          <img alt='Fish Olha' className='h-8 w-auto object-contain' src={logoSrc} />
        </button>
        <div className='flex h-8 w-8 items-center justify-center text-brand'>
          <Package className='h-5 w-5' />
        </div>
      </div>
    </header>
  );
}
