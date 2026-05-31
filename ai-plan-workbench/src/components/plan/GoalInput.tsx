"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import type { Plan } from "@/lib/plan/schema";

type GoalInputProps = {
  onGenerated: (plan: Plan) => void;
};

export function GoalInput({ onGenerated }: GoalInputProps) {
  const [input, setInput] = useState("I want to prepare for IELTS for 90 days, improve from 5.5 to 7.0, and study 2 hours per day.");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePlan() {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/plans/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input })
    });

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Failed to generate plan.");
      return;
    }

    onGenerated(data.plan);
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">AI Plan Workbench</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Turn one goal into a validated study plan.</h1>
        <p className="mt-3 text-base text-slate-600">
          Start with one sentence. The prototype generates a structured plan you can inspect, edit, and rebalance.
        </p>
      </div>
      <Textarea value={input} onChange={(event) => setInput(event.target.value)} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button onClick={generatePlan} disabled={isLoading || input.trim().length < 8}>
        {isLoading ? "Generating..." : "Generate plan"}
      </Button>
    </section>
  );
}
