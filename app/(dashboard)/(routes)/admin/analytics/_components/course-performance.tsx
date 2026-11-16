import Link from "next/link";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { CourseStat } from "@/actions/get-analytics";

interface CoursePerformanceProps {
  courses: CourseStat[];
}

const StatusBadge = ({ published }: { published: boolean }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      published ? "bg-brand-100 text-brand-800" : "bg-ink-100 text-ink-600"
    )}
  >
    {published ? "Published" : "Draft"}
  </span>
);

const Completion = ({ value }: { value: number | null }) =>
  value === null ? (
    <span className="text-ink-400">—</span>
  ) : (
    <div className="flex items-center gap-x-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-brand-700" style={{ width: `${value}%` }} />
      </div>
      <span className="tabular-nums">{value}%</span>
    </div>
  );

/** Per-course table on desktop, stacked cards on mobile (no horizontal scrolling). */
export const CoursePerformance = ({ courses }: CoursePerformanceProps) => {
  if (!courses.length) {
    return (
      <p className="py-8 text-center text-sm text-ink-500">
        You haven&apos;t created any courses yet.
      </p>
    );
  }

  return (
    <>
      {/* Mobile: cards */}
      <ul className="divide-y md:hidden">
        {courses.map((c) => (
          <li key={c.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-x-3">
              <Link
                href={`/admin/courses/${c.id}`}
                className="text-sm font-medium text-ink-900 hover:text-brand-700 line-clamp-2"
              >
                {c.title}
              </Link>
              <StatusBadge published={c.isPublished} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-ink-500">Revenue</dt>
                <dd className="font-medium text-ink-900 tabular-nums">{formatPrice(c.revenue)}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Sales</dt>
                <dd className="font-medium text-ink-900 tabular-nums">{c.sales}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Chapters live</dt>
                <dd className="font-medium text-ink-900 tabular-nums">
                  {c.publishedChapters}/{c.totalChapters}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Completion</dt>
                <dd className="font-medium text-ink-900">
                  <Completion value={c.completionRate} />
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Performance of each course</caption>
          <thead>
            <tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-ink-500">
              <th scope="col" className="pb-3 pr-4 font-medium">Course</th>
              <th scope="col" className="pb-3 pr-4 font-medium">Status</th>
              <th scope="col" className="pb-3 pr-4 text-right font-medium">Price</th>
              <th scope="col" className="pb-3 pr-4 text-right font-medium">Sales</th>
              <th scope="col" className="pb-3 pr-4 text-right font-medium">Revenue</th>
              <th scope="col" className="pb-3 pr-4 text-right font-medium">Chapters live</th>
              <th scope="col" className="pb-3 font-medium">Completion</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-ink-50">
                <td className="max-w-[280px] py-3 pr-4">
                  <Link
                    href={`/admin/courses/${c.id}`}
                    className="block truncate font-medium text-ink-900 hover:text-brand-700"
                    title={c.title}
                  >
                    {c.title}
                  </Link>
                </td>
                <td className="py-3 pr-4"><StatusBadge published={c.isPublished} /></td>
                <td className="py-3 pr-4 text-right tabular-nums text-ink-700">{formatPrice(c.price)}</td>
                <td className="py-3 pr-4 text-right tabular-nums text-ink-700">{c.sales}</td>
                <td className="py-3 pr-4 text-right font-medium tabular-nums text-ink-900">{formatPrice(c.revenue)}</td>
                <td className="py-3 pr-4 text-right tabular-nums text-ink-700">
                  {c.publishedChapters}/{c.totalChapters}
                </td>
                <td className="py-3 text-ink-700"><Completion value={c.completionRate} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
