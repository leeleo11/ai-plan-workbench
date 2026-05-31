type TabsProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({ value, options, onChange }: TabsProps<T>) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-white p-1">
      {options.map((option) => (
        <button
          key={option.value}
          className={`rounded px-3 py-1.5 text-sm ${value === option.value ? "bg-slate-950 text-white" : "text-slate-600"}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
