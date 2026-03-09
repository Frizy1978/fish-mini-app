import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export function Panel({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-panel border border-line bg-white p-5 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}
