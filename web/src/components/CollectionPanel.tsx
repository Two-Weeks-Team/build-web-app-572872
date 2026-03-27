"use client";

import type { Snapshot } from "@/lib/api";

export default function CollectionPanel({ loading, snapshots }: { loading: boolean; snapshots: Snapshot[] }) {
  return (
    <aside className="rounded-lg border border-border bg-card/75 p-4 shadow-soft">
      <h3 className="font-[--font-display] text-lg">Saved snapshots</h3>
      <p className="mb-3 text-xs text-muted-foreground">Reopen polished, client-ready planning briefs.</p>
      {loading && <p className="animate-pulse text-sm text-muted-foreground">Loading saved plans...</p>}
      {!loading && snapshots.length === 0 && <p className="text-sm text-warning">No snapshots yet. Save your first plan version.</p>}
      <div className="space-y-2">
        {snapshots.map((s) => (
          <button key={s.id} onClick={() => window.alert(`Snapshot: ${s.name}\nScenario: ${s.scenario}\n${s.summary}`)} className="w-full rounded-md border border-border bg-muted p-3 text-left">
            <p className="text-sm font-medium">{s.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.summary}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
