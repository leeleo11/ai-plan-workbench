import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg border-2 border-[var(--line)] bg-[var(--sun)] px-4 py-2 text-sm font-black text-[var(--ink)] shadow-[3px_3px_0_var(--line)] transition hover:-translate-y-0.5 hover:bg-[var(--orange)] hover:shadow-[5px_5px_0_var(--line)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--line)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
