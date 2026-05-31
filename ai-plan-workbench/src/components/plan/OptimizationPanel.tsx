"use client";

import { useState } from "react";
import type { Plan, PlanTask } from "@/lib/plan/schema";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { summarizePlanDiff } from "@/lib/plan/optimizer";

type OptimizationPanelProps = {
  plan: Plan;
  selectedTask: PlanTask | null;
  onApply: (plan: Plan) => void;
};

export function OptimizationPanel({ plan, selectedTask, onApply }: OptimizationPanelProps) {
  const [instruction, setInstruction] = useState("Make this task more specific and easier to execute.");
  const [previewPlan, setPreviewPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function preview() {
    if (!selectedTask) return;
    setIsLoading(true);
    const response = await fetch("/api/plans/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        selectedTaskIds: [selectedTask.id],
        instruction
      })
    });
    const data = await response.json();
    setPreviewPlan(data.plan);
    setIsLoading(false);
  }

  const diff = previewPlan ? summarizePlanDiff(plan, previewPlan) : null;

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">AI local optimization</h2>
      <p className="mt-2 text-xs text-slate-500">
        Select a task, preview AI changes, then apply only after review.
      </p>
      <Textarea className="mt-3 min-h-20 text-sm" value={instruction} onChange={(event) => setInstruction(event.target.value)} />
      <Button className="mt-3 w-full" onClick={preview} disabled={!selectedTask || isLoading}>
        {isLoading ? "Previewing..." : "Preview change"}
      </Button>
      {diff ? (
        <div className="mt-3 rounded-md bg-teal-50 p-3 text-sm text-teal-900">
          <p>{diff.summary}</p>
          <Button className="mt-3 w-full" onClick={() => previewPlan && onApply(previewPlan)}>
            Apply change
          </Button>
        </div>
      ) : null}
    </section>
  );
}
