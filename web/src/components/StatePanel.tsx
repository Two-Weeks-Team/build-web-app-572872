"use client";

export default function StatePanel({ loading, error, success, onRetry }: { loading: boolean; error: string | null; success: boolean; onRetry: () => void }) {
  if (loading) return <div className="mt-4 rounded-lg border border-border bg-card p-3 text-sm">Loading planning desk…</div>;
  if (error) return <div className="mt-4 rounded-lg border border-destructive bg-card p-3 text-sm">{error} <button className="ml-2 rounded bg-primary px-2 py-1 text-primary-foreground" onClick={onRetry}>Retry</button></div>;
  if (success) return <div className="mt-4 rounded-lg border border-success bg-card p-3 text-sm text-success">Workspace synced. Ready to generate or save snapshots.</div>;
  return <div className="mt-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">No active plan yet.</div>;
}
