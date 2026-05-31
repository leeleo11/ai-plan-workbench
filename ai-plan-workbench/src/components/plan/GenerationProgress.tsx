"use client";

import { useEffect, useState } from "react";

const steps = [
  { label: "解析目标", desc: "提取考试类型、时间、分数等关键信息" },
  { label: "匹配模板", desc: "选择最适合的学习计划模板" },
  { label: "拆分阶段", desc: "按学习规律划分基础、强化、冲刺等阶段" },
  { label: "校验可行性", desc: "检查时间安排、任务量是否合理" },
  { label: "生成可视化计划", desc: "创建可编辑的时间线和日历视图" }
];

export function GenerationProgress() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">正在生成计划</h2>
      <div className="mt-4 grid gap-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-start gap-3">
            <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-xs ${
              index < currentStep ? "bg-teal-500 text-white" :
              index === currentStep ? "bg-teal-500 text-white animate-pulse" :
              "bg-slate-200 text-slate-400"
            }`}>
              {index < currentStep ? "✓" : index + 1}
            </div>
            <div>
              <p className={`text-sm font-medium ${index <= currentStep ? "text-slate-950" : "text-slate-400"}`}>
                {step.label}
              </p>
              <p className={`text-xs ${index <= currentStep ? "text-slate-500" : "text-slate-300"}`}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
