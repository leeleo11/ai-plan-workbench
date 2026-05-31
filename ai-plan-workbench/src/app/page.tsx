"use client";

import { useState } from "react";
import { GoalInput } from "@/components/plan/GoalInput";
import { PlanWorkbench } from "@/components/plan/PlanWorkbench";
import type { Plan } from "@/lib/plan/schema";
import { savePlan } from "@/lib/storage/localPlanStore";

export default function Home() {
  const [plan, setPlan] = useState<Plan | null>(null);

  function handleGenerated(nextPlan: Plan) {
    savePlan(nextPlan);
    setPlan(nextPlan);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      {plan ? <PlanWorkbench initialPlan={plan} /> : <GoalInput onGenerated={handleGenerated} />}
    </main>
  );
}
