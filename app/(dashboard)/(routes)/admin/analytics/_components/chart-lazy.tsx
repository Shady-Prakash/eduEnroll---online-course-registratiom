"use client";

import dynamic from "next/dynamic";

/** Recharts is only needed on this page: load it in its own chunk, after first paint. */
export const LazyChart = dynamic(
  () => import("./chart").then((m) => m.Chart),
  {
    ssr: false,
    loading: () => (
      <div aria-hidden className="space-y-4">
        <div className="h-8 w-36 animate-pulse rounded-md bg-ink-100" />
        <div className="h-[220px] sm:h-[280px] animate-pulse rounded-md bg-ink-100" />
      </div>
    ),
  }
);
