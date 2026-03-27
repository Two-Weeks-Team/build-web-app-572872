"use client";

import type { PlanResponse, ScenarioType } from "@/lib/api";

export default function InsightPanel({ loading, busy, plan, scenario, onScenarioChange, onAssumptionPatch, error, success }: { loading: boolean; busy: boolean; plan: PlanResponse | null; scenario: ScenarioType; onScenarioChange: (s: ScenarioType) => void; onAssumptionPatch: (c: string) => void; error: string | null; success: string | null; }) {
  return (
    <section className="rounded-lg border border-border bg-card/75 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-[--font-display] text-xl">Structured Financial Brief</h2>
        <div className="flex gap-2">
          {(["conservative", "balanced", "aggressive"] as ScenarioType[]).map((s) => (
            <button key={s} onClick={() => onScenarioChange(s)} disabled={busy || loading} className={`rounded-md border px-2 py-1 text-xs ${scenario === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</button>
          ))}
        </div>
      </div>
      {loading && <p className="mt-4 animate-pulse text-sm text-muted-foreground">Building first-run Financial Brief...</p>}
      {!loading && !plan && <p className="mt-4 text-sm text-warning">No brief yet. Generate a plan from the intake panel.</p>}
      {error && <p className="mt-3 rounded-md border border-destructive/40 bg-muted p-2 text-sm text-destructive">{error}</p>}
      {success && <p className="mt-3 rounded-md border border-success/40 bg-muted p-2 text-sm text-success">{success}</p>}
      {plan && (
        <div className="mt-4 space-y-3 text-sm">
          <p className="rounded-md border border-border bg-muted p-3">{plan.summary}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-border bg-muted p-3"><p className="mb-2 font-medium">Assumption annotations</p>{(plan.assumptions || plan.items).slice(0, 4).map((a, i) => <p key={i} className="text-muted-foreground">• {a}</p>)}</div>
            <div className="rounded-md border border-border bg-muted p-3"><p className="mb-2 font-medium">Confidence notes</p>{(plan.confidence_notes || ["Income range inferred from narrative", "Debt APR estimated; verify lender statements"]).map((c, i) => <p key={i} className="text-muted-foreground">• {c}</p>)}</div>
          </div>
          <button onClick={() => onAssumptionPatch(`${plan.summary} | income updated +5% | retirement age 60`)} disabled={busy} className="rounded-md bg-accent px-3 py-2 text-xs text-accent-foreground disabled:opacity-60">Apply assumption edit (income + retirement age)</button>
        </div>
      )}
    </section>
  );
}
