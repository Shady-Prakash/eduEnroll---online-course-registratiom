import { formatPrice } from "@/lib/format";
import type { CourseStat } from "@/actions/get-analytics";

interface TopCoursesProps {
  courses: CourseStat[];
}

/**
 * Revenue by course as a ranked list with inline bars. Course titles are long,
 * so a list reads far better than a bar chart's axis labels, especially on mobile.
 */
export const TopCourses = ({ courses }: TopCoursesProps) => {
  const top = courses.filter((c) => c.sales > 0).slice(0, 5);
  const max = Math.max(...top.map((c) => c.revenue), 1);

  if (!top.length) {
    return (
      <p className="py-8 text-center text-sm text-ink-500">
        No course sales yet.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {top.map((course) => (
        <li key={course.id}>
          <div className="flex items-baseline justify-between gap-x-3 text-sm">
            <span className="truncate text-ink-700" title={course.title}>
              {course.title}
            </span>
            <span className="shrink-0 font-medium text-ink-900 tabular-nums">
              {formatPrice(course.revenue)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-x-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-brand-700"
                style={{ width: `${Math.max((course.revenue / max) * 100, 2)}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-right text-xs text-ink-500 tabular-nums">
              {course.sales} {course.sales === 1 ? "sale" : "sales"}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
};
