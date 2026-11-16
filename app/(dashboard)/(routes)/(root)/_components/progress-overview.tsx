import { Heading } from "@/components/ui/typography";
interface ProgressOverviewProps {
  chaptersCompleted: number;
  chaptersTotal: number;
  inProgress: number;
  completed: number;
}

/** Overall completion ring plus a breakdown of course states. */
export const ProgressOverview = ({
  chaptersCompleted,
  chaptersTotal,
  inProgress,
  completed,
}: ProgressOverviewProps) => {
  const pct = chaptersTotal ? Math.round((chaptersCompleted / chaptersTotal) * 100) : 0;
  const r = 42;
  const circumference = 2 * Math.PI * r;

  return (
    <section
      aria-labelledby="overview-heading"
      className="flex h-full flex-col rounded-xl border border-ink-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <Heading as="h2" id="overview-heading" size="sub">
        Overall progress
      </Heading>
      <p className="text-sm text-ink-500">Across all enrolled courses</p>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4 sm:flex-row lg:flex-col xl:flex-row">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" className="stroke-ink-100" />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className="stroke-brand-600 transition-[stroke-dashoffset] duration-700"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums text-ink-900">{pct}%</span>
            <span className="text-2xs text-ink-500">complete</span>
          </div>
        </div>

        <dl className="grid w-full grid-cols-3 gap-2 text-center sm:grid-cols-1 sm:text-left lg:grid-cols-3 lg:text-center xl:grid-cols-1 xl:text-left">
          <div className="rounded-lg bg-ink-50 p-2.5">
            <dt className="text-xs text-ink-500">Chapters</dt>
            <dd className="font-semibold tabular-nums text-ink-900">
              {chaptersCompleted}
              <span className="font-normal text-ink-400">/{chaptersTotal}</span>
            </dd>
          </div>
          <div className="rounded-lg bg-ink-50 p-2.5">
            <dt className="text-xs text-ink-500">In progress</dt>
            <dd className="font-semibold tabular-nums text-ink-900">{inProgress}</dd>
          </div>
          <div className="rounded-lg bg-ink-50 p-2.5">
            <dt className="text-xs text-ink-500">Completed</dt>
            <dd className="font-semibold tabular-nums text-ink-900">{completed}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
};
