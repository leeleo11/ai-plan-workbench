"use client";

import { useState } from "react";
import type { Plan, PlanTask } from "@/lib/plan/schema";
import { Tabs } from "@/components/ui/Tabs";
import { savePlan } from "@/lib/storage/localPlanStore";
import { applyPlanUpdate, undoLastChange } from "@/lib/plan/versioning";
import { PhaseOutline } from "./PhaseOutline";
import { TimelineView } from "./TimelineView";
import { CalendarView } from "./CalendarView";
import { RiskPanel } from "./RiskPanel";
import { TaskEditor } from "./TaskEditor";
import { OptimizationPanel } from "./OptimizationPanel";
import { Button } from "@/components/ui/Button";

type PlanWorkbenchProps = {
  initialPlan: Plan;
};

type WorkbenchTab = "timeline" | "calendar" | "risks";

export function PlanWorkbench({ initialPlan }: PlanWorkbenchProps) {
  const [plan, setPlan] = useState(initialPlan);
  const [tab, setTab] = useState<WorkbenchTab>("timeline");
  const [selectedTask, setSelectedTask] = useState<PlanTask | null>(null);

  function commitPlan(reason: string, nextPlan: Plan) {
    const versioned = applyPlanUpdate(plan, reason, nextPlan);
    setPlan(versioned);
    savePlan(versioned);
  }

  function updateTask(task: PlanTask) {
    const nextPlan = {
      ...plan,
      tasks: plan.tasks.map((item) => (item.id === task.id ? task : item))
    };
    commitPlan("编辑任务", nextPlan);
    setSelectedTask(task);
  }

  function undo() {
    const undone = undoLastChange(plan);
    setPlan(undone);
    savePlan(undone);
  }

  function applyOptimizedPlan(nextPlan: Plan) {
    setPlan(nextPlan);
    savePlan(nextPlan);
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">已校验计划</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">{plan.goal.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
            <span>{plan.tasks.length} 个任务</span>
            <span>·</span>
            <span>版本 {plan.version}</span>
            <span>·</span>
            <span>{plan.goal.currentLevel} → {plan.goal.targetLevel}</span>
            <span>·</span>
            <span>每日 {plan.goal.dailyAvailableMinutes} 分钟</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-white text-slate-950 ring-1 ring-slate-200 hover:bg-slate-100"
            onClick={undo}
            disabled={plan.history.length === 0}
          >
            撤销
          </Button>
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "timeline", label: "时间线" },
              { value: "calendar", label: "日历" },
              { value: "risks", label: "校验报告" }
            ]}
          />
        </div>
      </header>
      <div className="grid gap-5 lg:grid-cols-[260px_1fr_300px]">
        <PhaseOutline plan={plan} />
        <div>
          {tab === "timeline" ? <TimelineView plan={plan} onSelectTask={setSelectedTask} /> : null}
          {tab === "calendar" ? <CalendarView plan={plan} onSelectTask={setSelectedTask} /> : null}
          {tab === "risks" ? <RiskPanel plan={plan} /> : null}
        </div>
        <div className="grid gap-4">
          <TaskEditor task={selectedTask} onChange={updateTask} onClose={() => setSelectedTask(null)} />
          <OptimizationPanel plan={plan} selectedTask={selectedTask} onApply={applyOptimizedPlan} />
        </div>
      </div>
    </section>
  );
}
