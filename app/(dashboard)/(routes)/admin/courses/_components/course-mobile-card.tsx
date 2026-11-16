import Link from "next/link";

import { formatPrice } from "@/lib/format";

import type { CourseRow } from "./types";
import { ChapterProgress, CourseThumbnail, StatusBadge, formatUpdated } from "./course-cells";
import { CourseRowActions } from "./course-row-actions";

/** Compact course card used instead of table rows on small screens. */
export const CourseMobileCard = ({ course }: { course: CourseRow }) => (
  <div className="flex gap-x-3 p-4">
    <Link href={`/admin/courses/${course.id}`} className="shrink-0" tabIndex={-1} aria-hidden>
      <CourseThumbnail src={course.imageUrl} className="w-20" />
    </Link>

    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-x-2">
        <Link
          href={`/admin/courses/${course.id}`}
          className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-brand-700"
        >
          {course.title}
        </Link>
        <div className="-mr-2 -mt-1">
          <CourseRowActions course={course} />
        </div>
      </div>

      <p className="mt-0.5 truncate text-xs text-ink-500" suppressHydrationWarning>
        {course.code ? `${course.code} · ` : ""}{course.category ?? "Uncategorised"} · {formatUpdated(course.updatedAt)}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <StatusBadge published={course.isPublished} />
        <span className="text-sm font-medium tabular-nums text-ink-700">
          {course.price === null ? "No price" : course.price === 0 ? "Free" : formatPrice(course.price)}
        </span>
        <ChapterProgress published={course.chaptersPublished} total={course.chaptersTotal} />
      </div>
    </div>
  </div>
);
