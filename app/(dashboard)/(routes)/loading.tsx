// Streams instantly while dashboard pages fetch data on the server.
export default function Loading() {
  return (
    <div className="space-y-4 p-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-48 animate-pulse rounded-md bg-ink-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-lg bg-ink-100" />
        ))}
      </div>
    </div>
  );
}
