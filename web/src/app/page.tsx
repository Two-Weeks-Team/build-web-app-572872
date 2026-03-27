"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import WorkspacePanel from "@/components/WorkspacePanel";
import InsightPanel from "@/components/InsightPanel";
import CollectionPanel from "@/components/CollectionPanel";
import { fetchDemoPlan, parsePlan, recalculateScenario, saveSnapshot, fetchSnapshots, fetchInsights, type PlanResponse, type Snapshot, type ScenarioType } from "@/lib/api";

export default function Page() {
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [scenario, setScenario] = useState<ScenarioType>("balanced");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [seedPlan, saved] = await Promise.all([fetchDemoPlan(), fetchSnapshots()]);
        setPlan(seedPlan);
        setSnapshots(saved);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load planning desk.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onGenerate = async (query: string, preferences: string) => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const generated = await parsePlan({ query, preferences });
      setPlan(generated);
      setScenario("balanced");
      setSuccess("Financial Brief generated. Assumptions are ready for inline edits.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate plan.");
    } finally {
      setBusy(false);
    }
  };

  const onScenarioChange = async (next: ScenarioType) => {
    if (!plan) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await recalculateScenario({ selection: next, context: plan.summary });
      setPlan({ ...plan, ...updated, score: updated.score ?? plan.score });
      setScenario(next);
      setSuccess(`Scenario switched to ${next}. Timeline and allocations refreshed.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scenario update failed.");
    } finally {
      setBusy(false);
    }
  };

  const onAssumptionPatch = async (context: string) => {
    if (!plan) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await fetchInsights({ selection: scenario, context });
      setPlan({ ...plan, ...updated, score: updated.score ?? plan.score });
      setSuccess("Assumption edited. All artifacts restructured.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not recompute assumptions.");
    } finally {
      setBusy(false);
    }
  };

  const onSave = async (name: string) => {
    if (!plan) return;
    setBusy(true);
    setError(null);
    try {
      await saveSnapshot({ name, summary: plan.summary, scenario, score: plan.score });
      const saved = await fetchSnapshots();
      setSnapshots(saved);
      setSuccess("Snapshot saved. Reopen any version as a polished brief.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Snapshot save failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 pb-8 lg:grid-cols-[1.05fr_1.35fr_0.9fr]">
        <WorkspacePanel loading={loading} busy={busy} onGenerate={onGenerate} onSave={onSave} />
        <InsightPanel
          loading={loading}
          busy={busy}
          plan={plan}
          scenario={scenario}
          onScenarioChange={onScenarioChange}
          onAssumptionPatch={onAssumptionPatch}
          error={error}
          success={success}
        />
        <CollectionPanel loading={loading} snapshots={snapshots} />
      </div>
    </main>
  );
}
