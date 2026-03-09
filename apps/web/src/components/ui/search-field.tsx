import { Search } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Input } from './input';

export function SearchField({
  value,
  onChange,
  placeholder = 'Найти товар',
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[12px] border border-[#e3e3e3] bg-white px-4 py-3 shadow-[0_4px_14px_rgba(15,23,42,0.06)]',
        className
      )}
    >
      <Search className='h-4 w-4 text-slate-400' />
      <Input
        className='border-0 bg-transparent px-0 py-0 text-sm shadow-none focus:ring-0'
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}
