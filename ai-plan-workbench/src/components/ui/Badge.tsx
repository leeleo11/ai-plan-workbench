import type { PropsWithChildren } from "react";

export function Badge({ children }: PropsWithChildren) {
  return (
    <span className="inline-flex rounded-full border border-black/10 bg-[var(--mint)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ink)] transition-transform duration-150 hover:scale-105">
      {children}
    </span>
  );
}
