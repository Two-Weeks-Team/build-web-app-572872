"use client";

export default function ReferenceShelf() {
  return (
    <section className="mt-4 rounded-lg border border-border bg-card p-4">
      <h3 className="font-[--font-display] text-xl">Reference Shelf</h3>
      <p className="text-sm text-muted-foreground">Demo clients and snapshot examples available on first run.</p>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <div className="rounded-md border border-border bg-muted p-3 text-sm">Maya Chen • home + debt payoff</div>
        <div className="rounded-md border border-border bg-muted p-3 text-sm">Jordan Alvarez • retirement + education</div>
        <div className="rounded-md border border-border bg-muted p-3 text-sm">Priya Raman • irregular income planning</div>
      </div>
    </section>
  );
}
