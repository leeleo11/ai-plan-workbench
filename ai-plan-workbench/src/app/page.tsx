"use client";

import { useState } from "react";
import { GoalInput } from "@/components/plan/GoalInput";
import { GenerationProgress } from "@/components/plan/GenerationProgress";
import { PlanWorkbench } from "@/components/plan/PlanWorkbench";
import type { Plan } from "@/lib/plan/schema";
import { savePlan } from "@/lib/storage/localPlanStore";

export default function Home() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerated(nextPlan: Plan) {
    savePlan(nextPlan);
    setPlan(nextPlan);
    setIsGenerating(false);
  }

  function handleGenerateStart() {
    setIsGenerating(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      {isGenerating ? (
        <GenerationProgress />
      ) : plan ? (
        <PlanWorkbench initialPlan={plan} />
      ) : (
        <GoalInput onGenerated={handleGenerated} onGenerateStart={handleGenerateStart} />
      )}
    </main>
  );
}
