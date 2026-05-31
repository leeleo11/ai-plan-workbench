import type { PropsWithChildren } from "react";

export function Badge({ children }: PropsWithChildren) {
  return <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">{children}</span>;
}
