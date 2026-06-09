"use client";

import { useState } from "react";
import type { Plan, PlanTask } from "@/lib/plan/schema";
import { Tabs } from "@/components/ui/Tabs";
import { savePlan } from "@/lib/storage/localPlanStore";
import { getExecutionStats } from "@/lib/plan/executionStats";
import { planToMarkdown } from "@/lib/plan/exportPlan";
import { applyPlanUpdate, undoLastChange } from "@/lib/plan/versioning";
import { PhaseOutline } from "./PhaseOutline";
import { TimelineView } from "./TimelineView";
import { CalendarView } from "./CalendarView";
import { RiskPanel } from "./RiskPanel";
import { TaskEditor } from "./TaskEditor";
import { OptimizationPanel } from "./OptimizationPanel";
import { Button } from "@/components/ui/Button";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { DeskPet } from "@/components/ui/DeskPet";

type PlanWorkbenchProps = {
  initialPlan: Plan;
  onRestart?: () => void;
};

type WorkbenchTab = "timeline" | "calendar" | "risks";

const tabOptions: { value: WorkbenchTab; label: string }[] = [
  { value: "timeline", label: "闯关线" },
  { value: "calendar", label: "打卡日历" },
  { value: "risks", label: "老师批注" }
];

export function PlanWorkbench({ initialPlan, onRestart }: PlanWorkbenchProps) {
  const [plan, setPlan] = useState(initialPlan);
  const [tab, setTab] = useState<WorkbenchTab>("timeline");
  const [selectedTask, setSelectedTask] = useState<PlanTask | null>(null);
  const [suggestedInstruction, setSuggestedInstruction] = useState<string | undefined>();
  const [petMessage, setPetMessage] = useState<string | null>(null);
  const stats = getExecutionStats(plan);
  const nextTask = plan.tasks.find((task) => task.status !== "done");

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
    commitPlan("编辑任务卡", nextPlan);
    setSelectedTask(task);
  }

  function addTask(date: string) {
    const newTask: PlanTask = {
      id: `user-${Date.now()}`,
      title: "新任务卡",
      date,
      durationMinutes: plan.goal.dailyAvailableMinutes || 30,
      category: "practice",
      priority: "medium",
      status: "todo",
      dependsOn: [],
      source: "user_edited"
    };
    const nextPlan = {
      ...plan,
      tasks: [...plan.tasks, newTask]
    };
    commitPlan("添加任务", nextPlan);
    setSelectedTask(newTask);
    setTab("calendar");
    
    setPetMessage("新任务帮你记下来啦！");
    setTimeout(() => setPetMessage(null), 3000);
  }

  function moveTask(taskId: string, newDate: string) {
    const task = plan.tasks.find((t) => t.id === taskId);
    if (!task || task.date === newDate) return;
    
    const nextPlan = {
      ...plan,
      tasks: plan.tasks.map((t) =>
        t.id === taskId ? { ...t, date: newDate, source: "user_edited" as const } : t
      )
    };
    commitPlan("修改任务日期", nextPlan);
    if (selectedTask?.id === taskId) {
      setSelectedTask(nextPlan.tasks.find((t) => t.id === taskId) || null);
    }
  }

  function toggleTaskStatus(task: PlanTask) {
    const nextStatus = task.status === "done" ? "todo" : "done";
    const updatedTask: PlanTask = {
      ...task,
      status: nextStatus,
      source: "user_edited"
    };
    const nextPlan = {
      ...plan,
      tasks: plan.tasks.map((item) => (item.id === task.id ? updatedTask : item))
    };
    commitPlan(nextStatus === "done" ? "打卡通关" : "撤销打卡", nextPlan);
    if (selectedTask?.id === task.id) setSelectedTask(updatedTask);
    
    if (nextStatus === "done") {
      setPetMessage(`太棒啦！完成了 ${task.title} 🎉`);
    } else {
      setPetMessage("已撤销打卡，继续加油哦~");
    }
    setTimeout(() => setPetMessage(null), 3000);
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

  function exportMarkdown() {
    const blob = new Blob([planToMarkdown(plan)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${plan.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-5 stagger-fade-in">
      <DeskPet message={petMessage} />
      <header className="comic-border rounded-lg p-5">
        <div className="flex justify-between items-start mb-4">
          <p className="inline-flex rounded-full border-2 border-[var(--line)] bg-[var(--mint)] px-3 py-1 text-xs font-black animate-shimmer">
            计划生成成功，今日开局
          </p>
          <ThemeSwitcher />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-stretch">
          <div className="min-w-0">
            <h1 className="marker-title mt-1 text-3xl font-black leading-tight text-[var(--ink)] lg:text-4xl">
              {plan.goal.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-black text-[var(--ink)]">
              <span className="rounded-full border-2 border-[var(--line)] bg-[var(--sun)] px-3 py-1">
                {plan.tasks.length} 张任务卡
              </span>
              <span className="rounded-full border-2 border-[var(--line)] bg-white px-3 py-1">
                第 {plan.version} 版计划本
              </span>
              <span className="rounded-full border-2 border-[var(--line)] bg-[var(--sky)] px-3 py-1">
                每日 {plan.goal.dailyAvailableMinutes} 分钟
              </span>
              <span className="rounded-full border-2 border-[var(--line)] bg-[var(--peach)] px-3 py-1">
                已完成 {stats.progress}%
              </span>
              <span className="rounded-full border-2 border-[var(--line)] bg-[var(--mint)] px-3 py-1">
                连续 {stats.currentStreak} 天
              </span>
              <span className="rounded-full border-2 border-[var(--line)] bg-white px-3 py-1">
                待挑战 {stats.todoCount} 张
              </span>
            </div>
            <div className="mt-4 h-4 overflow-hidden rounded-full border-2 border-[var(--line)] bg-[var(--cream)]">
              <div className="h-full bg-[var(--berry)] transition-all duration-500 ease-out" style={{ width: `${stats.progress}%` }} />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--glass-border)] bg-white/40 p-4 shadow-[3px_3px_0_var(--glass-border)] backdrop-blur-md">
            <p className="text-xs font-black text-[var(--berry)]">下一张任务卡</p>
            <p className="mt-2 text-sm font-black leading-6 text-[var(--ink)]">
              {nextTask ? nextTask.title : "今天的关卡都通关了，可以去老师批注里复盘一下。"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {onRestart ? (
                <Button className="bg-white" onClick={onRestart}>
                  换个目标
                </Button>
              ) : null}
              <Button className="bg-white" onClick={undo} disabled={plan.history.length === 0}>
                撤销上一步
              </Button>
              <Button className="bg-[var(--mint)]" onClick={exportMarkdown}>
                导出计划
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end">
          <Tabs value={tab} onChange={setTab} options={tabOptions} />
        </div>
      </header>

      <section className="comic-border-soft rounded-lg p-5">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="inline-flex rounded-full border-2 border-[var(--line)] bg-[var(--sun)] px-3 py-1 text-xs font-black">
              AI 文字版规划
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-stone-700">{plan.brief.summary}</p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-lg border-2 border-[var(--line)] bg-white p-3">
              <h2 className="text-sm font-black text-[var(--ink)]">默认假设</h2>
              <ul className="mt-2 grid gap-1 text-xs font-semibold leading-5 text-stone-600">
                {plan.brief.assumptions.map((assumption) => (
                  <li key={assumption}>- {assumption}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border-2 border-[var(--line)] bg-white p-3">
              <h2 className="text-sm font-black text-[var(--ink)]">规划来源</h2>
              <div className="mt-2 grid gap-2">
                {plan.brief.sources.map((source) => (
                  <div key={`${source.type}-${source.title}`} className="rounded-md bg-[var(--cream)] px-2 py-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-black text-[var(--ink)]">{source.title}</p>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-stone-600">
                        {source.type}
                      </span>
                      {source.verificationStatus ? (
                        <span className="rounded-full bg-[var(--mint)] px-2 py-0.5 text-[10px] font-black text-[var(--ink)]">
                          {source.verificationStatus === "trusted"
                            ? "可信来源"
                            : source.verificationStatus === "failed"
                              ? "无法访问"
                              : "未验证"}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] font-semibold text-stone-600">{source.note}</p>
                    {source.url ? (
                      <a
                        className="mt-1 inline-flex text-[11px] font-black text-[var(--berry)] underline decoration-2 underline-offset-2"
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        查看来源
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr_320px]">
        <PhaseOutline plan={plan} />
        <div className="min-w-0">
          {tab === "timeline" ? (
            <TimelineView plan={plan} onSelectTask={setSelectedTask} onToggleTaskStatus={toggleTaskStatus} />
          ) : null}
          {tab === "calendar" ? <CalendarView plan={plan} onSelectTask={setSelectedTask} onAddTask={addTask} onMoveTask={moveTask} /> : null}
          {tab === "risks" ? (
            <RiskPanel
              plan={plan}
              onUseAction={(instruction) => {
                setSuggestedInstruction(instruction);
              }}
            />
          ) : null}
        </div>
        <div className="grid gap-4">
          <TaskEditor task={selectedTask} onChange={updateTask} onClose={() => setSelectedTask(null)} />
          <OptimizationPanel
            key={suggestedInstruction ?? "default-instruction"}
            plan={plan}
            selectedTask={selectedTask}
            onApply={applyOptimizedPlan}
            initialInstruction={suggestedInstruction}
          />
        </div>
      </div>
    </section>
  );
}
