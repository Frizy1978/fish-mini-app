import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export function Badge({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-line",
        className
      )}
    >
      {children}
    </span>
  );
}
