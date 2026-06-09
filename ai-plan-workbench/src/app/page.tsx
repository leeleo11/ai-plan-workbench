"use client";

import { useEffect, useState } from "react";
import { GoalInput } from "@/components/plan/GoalInput";
import { GenerationProgress } from "@/components/plan/GenerationProgress";
import { PlanWorkbench } from "@/components/plan/PlanWorkbench";
import type { Plan } from "@/lib/plan/schema";
import { getLatestPlan, savePlan } from "@/lib/storage/localPlanStore";

export default function Home() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    const latestPlan = getLatestPlan();
    if (latestPlan) queueMicrotask(() => setPlan(latestPlan));
  }, []);

  async function handleGenerated(nextPlan: Plan) {
    savePlan(nextPlan);
    setPlan(nextPlan);
    setGenerationError(null);
    setIsGenerating(false);
  }

  return (
    <main className="min-h-screen overflow-hidden px-4 py-6 md:px-8">
      <div className="pointer-events-none fixed -right-12 top-12 h-36 w-36 rotate-12 rounded-lg border-2 border-[var(--line)] bg-[var(--peach)] opacity-70 shadow-[5px_5px_0_var(--line)]" />
      <div className="pointer-events-none fixed bottom-10 left-8 h-24 w-24 -rotate-6 rounded-full border-2 border-[var(--line)] bg-[var(--mint)] opacity-70 shadow-[4px_4px_0_var(--line)]" />
      {isGenerating ? (
        <GenerationProgress />
      ) : plan ? (
        <PlanWorkbench
          initialPlan={plan}
          onRestart={() => {
            setPlan(null);
            setGenerationError(null);
            setIsGenerating(false);
          }}
        />
      ) : (
        <GoalInput
          onGenerated={handleGenerated}
          onGenerateStart={() => {
            setGenerationError(null);
            setIsGenerating(true);
          }}
          onGenerateEnd={() => setIsGenerating(false)}
          onGenerateError={setGenerationError}
          externalError={generationError}
        />
      )}
    </main>
  );
}
