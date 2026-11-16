import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ActivityDay } from "@/actions/get-dashboard-courses";
import { Heading } from "@/components/ui/typography";

interface ActivityChartProps {
  days: ActivityDay[];
  thisWeek: number;
  streak: number;
}

/**
 * Chapters completed per day over the last 7 days.
 * A single-series bar chart in plain HTML/CSS: no chart library on the
 * dashboard's critical path. Hover/focus a bar for its exact value.
 */
export const ActivityChart = ({ days, thisWeek, streak }: ActivityChartProps) => {
  const max = Math.max(...days.map((d) => d.count), 1);
  const todayKey = days[days.length - 1]?.key;

  return (
    <section
      aria-labelledby="activity-heading"
      className="flex h-full flex-col rounded-xl border border-ink-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex items-start justify-between gap-x-4">
        <div>
          <Heading as="h2" id="activity-heading" size="sub">
            Learning activity
          </Heading>
          <p className="text-sm text-ink-500">Chapters completed, last 7 days</p>
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center gap-x-1 rounded-full px-2.5 py-1 text-xs font-medium",
            streak ? "bg-warning-50 text-warning-700" : "bg-ink-100 text-ink-500"
          )}
          title="Consecutive days with at least one completed chapter"
        >
          <Flame className="h-3.5 w-3.5" aria-hidden />
          {streak} day{streak === 1 ? "" : "s"} streak
        </div>
      </div>

      <p className="mt-4 text-3xl font-semibold tabular-nums text-ink-900">
        {thisWeek}
        <span className="ml-1.5 text-sm font-normal text-ink-500">
          chapter{thisWeek === 1 ? "" : "s"} this week
        </span>
      </p>

      <ol className="mt-4 flex flex-1 items-end gap-2 sm:gap-3" aria-label="Chapters completed per day">
        {days.map((day) => {
          const isToday = day.key === todayKey;
          const height = day.count ? Math.max((day.count / max) * 100, 8) : 0;
          return (
            <li key={day.key} className="group flex min-w-0 flex-1 flex-col items-center gap-y-2">
              <div
                tabIndex={0}
                className="relative flex h-28 w-full items-end justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30 sm:h-32"
                aria-label={`${day.date}: ${day.count} chapter${day.count === 1 ? "" : "s"}`}
              >
                {/* tooltip */}
                <span className="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded bg-ink-900 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  {day.count} · {day.date}
                </span>
                {/* baseline track */}
                <div className="absolute inset-x-0 bottom-0 h-full rounded-md bg-ink-50" aria-hidden />
                <div
                  className={cn(
                    "relative w-full max-w-[36px] rounded-t transition-all",
                    isToday ? "bg-brand-700" : "bg-brand-500/80 group-hover:bg-brand-600"
                  )}
                  style={{ height: `${height}%` }}
                  aria-hidden
                />
              </div>
              <span className={cn("text-xs", isToday ? "font-semibold text-ink-900" : "text-ink-500")}>
                {day.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
