"use client";

import type { PlanResponse } from "@/lib/api";

export default function FeaturePanel({ plan }: { plan: PlanResponse | null }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h3 className="font-[--font-display] text-xl">Goal Timeline & Allocation Band</h3>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        {(plan?.items || ["Emergency fund to 6 months", "Debt payoff in 28 months", "Home down payment in 36 months", "Retirement contribution raise in 12 months"]).map((item, idx) => (
          <div key={item + idx} className="rounded-md border border-border bg-muted p-2">{item}</div>
        ))}
      </div>
    </section>
  );
}
