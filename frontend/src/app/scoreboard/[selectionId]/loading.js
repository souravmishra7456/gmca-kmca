export default function ScoreboardLoading() {
  return (
    <main
      className="min-h-screen bg-slate-100 px-0 py-0 sm:px-6 sm:py-8"
      role="status"
      aria-live="polite"
      aria-label="Loading match scorecard"
    >
      <div className="mx-auto max-w-5xl space-y-5 bg-white p-4 sm:rounded-2xl sm:p-6">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="flex items-start justify-between gap-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
        </div>
        <div className="h-56 animate-pulse rounded-xl bg-slate-100" />
        <span className="sr-only">Loading match scorecard…</span>
      </div>
    </main>
  );
}
