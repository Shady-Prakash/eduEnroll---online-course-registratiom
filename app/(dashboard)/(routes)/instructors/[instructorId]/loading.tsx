export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6" aria-busy="true">
      <span className="sr-only">Loading instructor…</span>
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <div className="h-28 animate-pulse bg-ink-200 sm:h-36" />
        <div className="space-y-4 px-6 pb-6">
          <div className="-mt-12 h-24 w-24 animate-pulse rounded-full border-4 border-white bg-ink-300" />
          <div className="h-7 w-56 animate-pulse rounded bg-ink-200" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-ink-100" />)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-ink-100" />)}
      </div>
    </div>
  );
}
