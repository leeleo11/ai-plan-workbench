"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import type { Plan } from "@/lib/plan/schema";

type GoalInputProps = {
  onGenerated: (plan: Plan) => void;
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
  onGenerateError?: (message: string) => void;
  externalError?: string | null;
};

const examples = [
  {
    goal: "30天养成晨跑习惯",
    durationDays: "30",
    currentLevel: "偶尔跑，坚持不下来",
    targetLevel: "能连续跑30分钟不喘",
    dailyHours: "1",
    startDate: "2026-06-02"
  },
  {
    goal: "60天完成一个Side Project",
    durationDays: "60",
    currentLevel: "有想法但没动手",
    targetLevel: "上线一个可用的小产品",
    dailyHours: "2",
    startDate: "2026-06-02"
  },
  {
    goal: "学会 Python 数据分析",
    durationDays: "30",
    currentLevel: "会一点基础语法",
    targetLevel: "能独立完成一个数据分析小项目",
    dailyHours: "1",
    startDate: "2026-06-02"
  }
];

function composePlanInput({
  goal,
  durationDays,
  currentLevel,
  targetLevel,
  dailyHours,
  startDate
}: {
  goal: string;
  durationDays: string;
  currentLevel: string;
  targetLevel: string;
  dailyHours: string;
  startDate: string;
}) {
  const isDurationUncertain = durationDays.trim() === "";
  const parts = [
    startDate.trim() ? `${startDate.trim()}开始` : "",
    isDurationUncertain ? `${goal.trim()}，计划时长暂不确定，先生成30天滚动计划` : `${durationDays.trim()}天${goal.trim()}`,
    currentLevel.trim() || targetLevel.trim()
      ? `从${currentLevel.trim() || "未说明"}到${targetLevel.trim() || "未说明"}`
      : "",
    dailyHours.trim() ? `每天投入${dailyHours.trim()}小时` : ""
  ].filter(Boolean);

  return parts.join("，");
}

export function GoalInput({
  onGenerated,
  onGenerateStart,
  onGenerateEnd,
  onGenerateError,
  externalError
}: GoalInputProps) {
  const [goal, setGoal] = useState(examples[0].goal);
  const [durationDays, setDurationDays] = useState(examples[0].durationDays);
  const [currentLevel, setCurrentLevel] = useState(examples[0].currentLevel);
  const [targetLevel, setTargetLevel] = useState(examples[0].targetLevel);
  const [dailyHours, setDailyHours] = useState(examples[0].dailyHours);
  const [startDate, setStartDate] = useState(examples[0].startDate);
  const [isDurationUncertain, setIsDurationUncertain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const input = useMemo(
    () => composePlanInput({ goal, durationDays, currentLevel, targetLevel, dailyHours, startDate }),
    [goal, durationDays, currentLevel, targetLevel, dailyHours, startDate]
  );

  const canGenerate = goal.trim().length >= 2 && (isDurationUncertain || durationDays.trim().length > 0);

  function applyExample(example: (typeof examples)[number]) {
    setGoal(example.goal);
    setDurationDays(example.durationDays);
    setCurrentLevel(example.currentLevel);
    setTargetLevel(example.targetLevel);
    setDailyHours(example.dailyHours);
    setStartDate(example.startDate);
    setIsDurationUncertain(false);
  }

  async function generatePlan() {
    setIsLoading(true);
    setError(null);
    onGenerateStart?.();

    try {
      const response = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input })
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.error ?? "计划生成遇到问题，请稍后再试。";
        setError(message);
        onGenerateError?.(message);
        onGenerateEnd?.();
        return;
      }

      onGenerated(data.plan);
    } catch {
      const message = "网络连接不稳定，请稍后再试。";
      setError(message);
      onGenerateError?.(message);
      onGenerateEnd?.();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative">
        <div className="absolute -left-3 -top-6 rotate-[-8deg] rounded-lg border-2 border-[var(--line)] bg-[var(--sun)] px-3 py-1 text-xs font-black shadow-[3px_3px_0_var(--line)]">
          AI 同桌计划局
        </div>
        <p className="text-sm font-black tracking-[0.25em] text-stone-600">AI 目标拆解 · 闯关时间线</p>
        <h1 className="marker-title mt-4 max-w-2xl text-5xl font-black leading-tight text-[var(--ink)] md:text-6xl">
          把一句大目标，变成每天愿意打开的任务卡
        </h1>
        <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-stone-700">
          先告诉同桌你的目标、现在在哪、想走到哪，以及每天能投入多久。AI 会先写出文字规划，再拆成阶段关卡、每日任务和打卡时间线。
        </p>
        <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
          {[
            ["1号抽屉", "目标和当前水平"],
            ["2号抽屉", "阶段关卡"],
            ["3号抽屉", "每日任务卡"]
          ].map(([title, desc]) => (
            <div key={title} className="comic-border-soft rounded-lg bg-white p-3">
              <p className="text-xs font-black text-[var(--berry)]">{title}</p>
              <p className="mt-1 text-sm font-black text-[var(--ink)]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="comic-border relative rounded-lg bg-white p-5">
        <div className="absolute -right-4 -top-5 rotate-6 rounded-lg border-2 border-[var(--line)] bg-[var(--mint)] px-4 py-2 text-sm font-black shadow-[3px_3px_0_var(--line)]">
          填完就开画
        </div>
        <div className="rounded-lg border-2 border-dashed border-[var(--line)] bg-[var(--cream)] p-4">
          <div className="grid gap-4">
            <label className="block">
              <span className="block text-sm font-black text-[var(--ink)]">大目标</span>
              <Textarea
                aria-label="大目标"
                className="mt-2 min-h-24"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="例如：30天养成晨跑习惯、60天完成一个项目、学会Python数据分析"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="block text-sm font-black text-[var(--ink)]">开始日期</span>
                <input
                  aria-label="开始日期"
                  className="mt-2 h-12 w-full rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-4 text-base font-black text-[var(--ink)] outline-none shadow-[3px_3px_0_rgba(44,36,24,0.75)] transition focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--line)]"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label className="block">
                <span className="block text-sm font-black text-[var(--ink)]">计划天数</span>
                <input
                  aria-label="计划天数"
                  className="mt-2 h-12 w-full rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-4 text-base font-black text-[var(--ink)] outline-none shadow-[3px_3px_0_rgba(44,36,24,0.75)] transition focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--line)]"
                  inputMode="numeric"
                  value={isDurationUncertain ? "" : durationDays}
                  onChange={(event) => setDurationDays(event.target.value)}
                  placeholder="90"
                  disabled={isDurationUncertain}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-sm font-black text-[var(--ink)]">每天投入小时</span>
                <input
                  aria-label="每天学习小时"
                  className="mt-2 h-12 w-full rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-4 text-base font-black text-[var(--ink)] outline-none shadow-[3px_3px_0_rgba(44,36,24,0.75)] transition focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--line)]"
                  inputMode="decimal"
                  value={dailyHours}
                  onChange={(event) => setDailyHours(event.target.value)}
                  placeholder="2"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="block text-sm font-black text-[var(--ink)]">当前水平</span>
                <input
                  aria-label="当前水平"
                  className="mt-2 h-12 w-full rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-4 text-base font-black text-[var(--ink)] outline-none shadow-[3px_3px_0_rgba(44,36,24,0.75)] transition focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--line)]"
                  value={currentLevel}
                  onChange={(event) => setCurrentLevel(event.target.value)}
                  placeholder="例如：零基础 / 会一点 / 已做完一轮"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-black text-[var(--ink)]">目标水平</span>
                <input
                  aria-label="目标水平"
                  className="mt-2 h-12 w-full rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-4 text-base font-black text-[var(--ink)] outline-none shadow-[3px_3px_0_rgba(44,36,24,0.75)] transition focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--line)]"
                  value={targetLevel}
                  onChange={(event) => setTargetLevel(event.target.value)}
                  placeholder="例如：能独立做项目 / 连续跑30分钟"
                />
              </label>
            </div>
          </div>

          <button
            className={`mt-3 rounded-lg border-2 border-[var(--line)] px-3 py-2 text-left text-xs font-black shadow-[2px_2px_0_var(--line)] ${
              isDurationUncertain ? "bg-[var(--mint)] text-[var(--ink)]" : "bg-white text-stone-600"
            }`}
            onClick={() => {
              setIsDurationUncertain((value) => !value);
              if (!isDurationUncertain) setDurationDays("");
              else setDurationDays(examples[0].durationDays);
            }}
          >
            时间还不确定，先做 30 天滚动计划
          </button>

          <div className="mt-4 rounded-lg border-2 border-[var(--line)] bg-white/80 p-3">
            <p className="text-xs font-black text-stone-500">同桌会这样理解</p>
            <p className="mt-1 text-sm font-black leading-6 text-[var(--ink)]">{input}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example.goal}
                onClick={() => applyExample(example)}
                className="rounded-full border-2 border-[var(--line)] bg-white px-3 py-1 text-xs font-black text-[var(--ink)] shadow-[2px_2px_0_var(--line)] transition hover:bg-[var(--sky)]"
              >
                {example.durationDays}天 · {example.goal}
              </button>
            ))}
          </div>
          {error || externalError ? <p className="mt-3 text-sm font-black text-red-600">{error ?? externalError}</p> : null}
          <Button className="mt-5 w-full text-base" onClick={generatePlan} disabled={isLoading || !canGenerate}>
            {isLoading ? "正在画任务卡..." : "生成我的闯关计划"}
          </Button>
        </div>
      </div>
    </section>
  );
}
