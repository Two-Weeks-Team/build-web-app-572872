"use client";

import type { PlanResponse, SnapshotItem } from "@/lib/api";

export default function StatsStrip({ items, plan }: { items: SnapshotItem[]; plan: PlanResponse | null }) {
  return (
    <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Saved Snapshots</p><p className="text-lg font-semibold">{items.length}</p></div>
      <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Plan Confidence</p><p className="text-lg font-semibold text-success">{plan ? `${plan.score}%` : "—"}</p></div>
      <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Active Goals</p><p className="text-lg font-semibold">{plan ? plan.items.length : "—"}</p></div>
      <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Scenario Rail</p><p className="text-lg font-semibold text-warning">Balanced</p></div>
    </section>
  );
}
