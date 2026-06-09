type TabsProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({ value, options, onChange }: TabsProps<T>) {
  return (
    <div className="inline-flex gap-1 rounded-lg bg-[var(--paper)] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          className={`rounded-md px-5 py-2 text-sm font-semibold transition-all duration-200 ${
            value === option.value
            ? "bg-[var(--color-info)] text-[var(--ink)] shadow-sm scale-[1.02]"
            : "text-[var(--foreground)] hover:bg-[var(--cream)] hover:text-[var(--ink)]"
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
