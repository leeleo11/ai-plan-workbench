import type { PropsWithChildren } from "react";

export function Badge({ children }: PropsWithChildren) {
  return (
    <span className="inline-flex rounded-full border-2 border-[var(--line)] bg-[var(--mint)] px-2 py-0.5 text-xs font-black text-[var(--ink)]">
      {children}
    </span>
  );
}
