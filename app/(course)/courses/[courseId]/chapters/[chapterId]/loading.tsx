export default function Loading() {
  return (
    <div className="pb-16" aria-busy="true">
      <span className="sr-only">Loading chapter…</span>
      <div className="md:px-6 md:pt-6">
        <div className="mx-auto aspect-video max-w-5xl animate-pulse bg-ink-200 md:rounded-xl" />
      </div>
      <div className="mx-auto max-w-5xl space-y-8 px-4 pt-6 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-ink-200" />
            <div className="h-8 w-72 max-w-full animate-pulse rounded-md bg-ink-200" />
          </div>
          <div className="h-11 w-full animate-pulse rounded-md bg-ink-200 lg:w-48" />
        </div>
        <div className="space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-ink-200" />
          <div className="h-32 animate-pulse rounded-xl bg-ink-100" />
        </div>
      </div>
    </div>
  );
}
