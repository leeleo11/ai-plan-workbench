import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg border border-black/10 bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:brightness-95 active:translate-y-0 active:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
