import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-32 w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-base font-medium text-[var(--ink)] outline-none shadow-sm transition-all duration-200 placeholder:text-[var(--foreground)]/50 focus:border-[var(--color-primary)]/30 focus:shadow-md focus:ring-2 focus:ring-[var(--color-primary)]/20 ${className}`}
      {...props}
    />
  );
}
