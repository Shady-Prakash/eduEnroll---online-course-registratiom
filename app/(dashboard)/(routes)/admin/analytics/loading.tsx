export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6" aria-busy="true">
      <span className="sr-only">Loading analytics…</span>
      <div className="h-8 w-40 animate-pulse rounded-md bg-ink-200" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-ink-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-lg bg-ink-100 lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-lg bg-ink-100" />
      </div>
    </div>
  );
}
