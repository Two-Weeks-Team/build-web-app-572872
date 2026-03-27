"use client";

import { FormEvent, useState } from "react";

export default function WorkspacePanel({ loading, busy, onGenerate, onSave }: { loading: boolean; busy: boolean; onGenerate: (q: string, p: string) => void; onSave: (n: string) => void; }) {
  const [query, setQuery] = useState("Maya Chen, 34, wants to buy a home in 3 years while paying off student loans. She earns about $8,700 monthly before tax, has $24k in savings, contributes 5% to retirement, and worries she is behind.");
  const [preferences, setPreferences] = useState("Balanced plan, keep flexibility for home purchase, retirement age 62");
  const [snapshotName, setSnapshotName] = useState("Balanced Family Wealth Plan v1");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onGenerate(query, preferences);
  };

  return (
    <section className="rounded-lg border border-border bg-card/75 p-4 shadow-soft">
      <h2 className="font-[--font-display] text-xl">Messy intake parser</h2>
      <p className="mb-3 text-sm text-muted-foreground">Paste notes, advisor intake text, or rough bullet points. FinFlow extracts assumptions in one pass.</p>
      <form onSubmit={submit} className="space-y-3">
        <textarea value={query} onChange={(e) => setQuery(e.target.value)} className="h-40 w-full rounded-md border border-border bg-muted p-3 text-sm outline-none" />
        <input value={preferences} onChange={(e) => setPreferences(e.target.value)} className="w-full rounded-md border border-border bg-muted p-3 text-sm outline-none" />
        <button onClick={() => {}} disabled={busy || loading} type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {busy ? "Generating plan..." : "Generate Plan"}
        </button>
      </form>
      <div className="mt-4 rounded-md border border-border bg-muted p-3">
        <p className="text-xs text-muted-foreground">Save this plan snapshot</p>
        <div className="mt-2 flex gap-2">
          <input value={snapshotName} onChange={(e) => setSnapshotName(e.target.value)} className="flex-1 rounded-md border border-border bg-card p-2 text-sm" />
          <button onClick={() => onSave(snapshotName)} disabled={busy || loading} className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground disabled:opacity-60">Save</button>
        </div>
      </div>
    </section>
  );
}
