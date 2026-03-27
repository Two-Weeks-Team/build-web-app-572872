export default function Hero() {
  return (
    <header className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="rounded-lg border border-border bg-card/80 p-5 shadow-soft backdrop-blur">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">FinFlow AI · Planning Desk</p>
        <h1 className="mt-2 font-[--font-display] text-3xl text-foreground">Turn rough money notes into a trusted Financial Brief</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Paste a messy intake, review assumptions, compare conservative/balanced/aggressive scenarios, and save client-ready snapshots.
        </p>
      </div>
    </header>
  );
}
