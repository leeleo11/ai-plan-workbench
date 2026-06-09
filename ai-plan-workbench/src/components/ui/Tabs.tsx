type TabsProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({ value, options, onChange }: TabsProps<T>) {
  return (
    <div className="inline-flex rounded-lg border-2 border-[var(--line)] bg-white p-1 shadow-[3px_3px_0_var(--line)]">
      {options.map((option) => (
        <button
          key={option.value}
          className={`rounded-md px-3 py-1.5 text-sm font-black transition ${
            value === option.value ? "bg-[var(--sky)] text-[var(--ink)]" : "text-stone-600 hover:bg-[var(--cream)]"
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
