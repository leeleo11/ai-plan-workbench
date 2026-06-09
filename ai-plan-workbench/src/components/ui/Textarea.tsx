import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-32 w-full resize-none rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-base font-semibold text-[var(--ink)] outline-none shadow-[3px_3px_0_rgba(44,36,24,0.75)] transition placeholder:text-stone-400 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--line)] ${className}`}
      {...props}
    />
  );
}
