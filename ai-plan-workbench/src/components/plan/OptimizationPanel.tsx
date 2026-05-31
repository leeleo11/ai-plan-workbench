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
  const [instruction, setInstruction] = useState("让这个任务更具体、更容易执行。");
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
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">AI 局部优化</h2>
      <p className="mt-1 text-xs text-slate-500">
        选择任务后，可以让 AI 调整任务内容，预览变更后再应用。
      </p>
      <Textarea className="mt-3 min-h-16 text-sm" value={instruction} onChange={(event) => setInstruction(event.target.value)} />
      <Button className="mt-3 w-full" onClick={preview} disabled={!selectedTask || isLoading}>
        {isLoading ? "正在预览..." : "预览变更"}
      </Button>
      {diff ? (
        <div className="mt-3 rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
          <p className="font-medium">变更预览</p>
          <p className="mt-1 text-xs">{diff.summary}</p>
          <Button className="mt-3 w-full" onClick={() => previewPlan && onApply(previewPlan)}>
            应用变更
          </Button>
        </div>
      ) : null}
    </section>
  );
}
