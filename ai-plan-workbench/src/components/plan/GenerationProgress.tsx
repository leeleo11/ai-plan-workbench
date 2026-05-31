export function GenerationProgress() {
  const steps = ["Analyzing goal", "Matching template", "Splitting phases", "Validating feasibility", "Creating plan view"];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">Generation steps</h2>
      <div className="mt-3 grid gap-2">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
