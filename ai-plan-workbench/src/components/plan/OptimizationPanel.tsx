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
  initialInstruction?: string;
};

export function OptimizationPanel({ plan, selectedTask, onApply, initialInstruction }: OptimizationPanelProps) {
  const [instruction, setInstruction] = useState(initialInstruction ?? "把这张任务卡改得更具体一点，并降低一点压力。");
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
    <section className="comic-border-soft rounded-lg bg-white p-4">
      <h2 className="text-base font-black text-[var(--ink)]">同桌帮你改</h2>
      <p className="mt-1 text-xs font-semibold leading-5 text-stone-600">
        选中一张任务卡，再告诉 AI 你想怎么改。先预览，不会偷偷覆盖计划。
      </p>
      <Textarea
        className="mt-3 min-h-20 text-sm"
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
      />
      <Button className="mt-3 w-full" onClick={preview} disabled={!selectedTask || isLoading}>
        {isLoading ? "正在打草稿..." : "预览修改"}
      </Button>
      {diff ? (
        <div className="mt-3 rounded-lg border-2 border-[var(--line)] bg-[var(--mint)] p-3 text-sm font-bold text-[var(--ink)]">
          <p className="font-black">修改预览</p>
          <p className="mt-1 text-xs">{diff.summary}</p>
          <Button className="mt-3 w-full bg-[var(--peach)]" onClick={() => previewPlan && onApply(previewPlan)}>
            应用这次修改
          </Button>
        </div>
      ) : null}
    </section>
  );
}
