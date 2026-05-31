"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import type { Plan } from "@/lib/plan/schema";

type GoalInputProps = {
  onGenerated: (plan: Plan) => void;
  onGenerateStart?: () => void;
};

export function GoalInput({ onGenerated, onGenerateStart }: GoalInputProps) {
  const [input, setInput] = useState("我想用90天准备雅思，从5.5分提高到7.0分，每天学习2小时。");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePlan() {
    setIsLoading(true);
    setError(null);
    onGenerateStart?.();

    const response = await fetch("/api/plans/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input })
    });

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "生成计划失败，请重试。");
      return;
    }

    onGenerated(data.plan);
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">AI 计划工作台</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-950">一句话目标，生成可执行计划</h1>
        <p className="mt-3 text-lg text-slate-600">
          输入你的目标，AI 自动生成结构化计划，支持编辑、校验和优化。
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-2">描述你的目标</label>
        <Textarea value={input} onChange={(event) => setInput(event.target.value)} />
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            "考研英语90天冲刺",
            "30天学会Python数据分析",
            "60天准备公务员考试"
          ].map((example) => (
            <button
              key={example}
              onClick={() => setInput(example)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200"
            >
              {example}
            </button>
          ))}
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <Button className="mt-4 w-full" onClick={generatePlan} disabled={isLoading || input.trim().length < 4}>
          {isLoading ? "正在生成计划..." : "生成计划"}
        </Button>
      </div>
    </section>
  );
}
