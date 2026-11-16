import Image from "next/image";
import Link from "next/link";
import { BarChart3, BookOpen, CheckCircle2, ImageIcon, Users } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { levelLabel } from "@/lib/validations/course";
import { cn } from "@/lib/utils";
import type { CourseResult } from "@/actions/search-courses";
import { RatingLine } from "@/components/ui/stars";
import { Heading } from "@/components/ui/typography";

const NEW_DAYS = 30;

/** Udemy-style horizontal search result: thumbnail · details · price. */
export const CourseResultCard = ({ course }: { course: CourseResult }) => {
  const level = levelLabel(course.level);
  const enrolled = course.progress !== null;
  const free = course.currentPrice <= 0;
  const isNew = Date.now() - new Date(course.createdAt).getTime() < NEW_DAYS * 86_400_000;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex gap-3 rounded-xl p-2 transition hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:gap-4 sm:p-3"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-28 shrink-0 self-start overflow-hidden rounded-lg bg-ink-100 ring-1 ring-ink-200 sm:w-48 md:w-60">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 240px, (min-width: 640px) 192px, 112px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-6 w-6 text-ink-300" aria-hidden />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-y-1 sm:flex-row sm:gap-x-6">
        <div className="min-w-0 flex-1 space-y-1">
          <Heading as="h3" size="label" className="line-clamp-2 group-hover:text-brand-800 sm:text-base">
            {course.title}
          </Heading>
          {course.subtitle && (
            <p className="line-clamp-2 hidden text-sm text-ink-600 sm:block">{course.subtitle}</p>
          )}
          {course.ratingCount > 0 && (
            <RatingLine average={course.rating} count={course.ratingCount} size="xs" className="text-xs text-ink-500" />
          )}
          <p className="truncate text-xs text-ink-500">
            {course.instructor ?? "KOI teacher"}
            {course.term && <span className="hidden sm:inline"> · {course.term}</span>}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs text-ink-500">
            {course.code && (
              <span className="rounded bg-ink-900 px-1.5 py-0.5 text-3xs font-semibold tracking-wide text-white">{course.code}</span>
            )}
            <span className="inline-flex items-center gap-x-1">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              {course.chaptersCount} chapter{course.chaptersCount === 1 ? "" : "s"}
            </span>
            {level && (
              <span className="hidden items-center gap-x-1 sm:inline-flex">
                <BarChart3 className="h-3.5 w-3.5" aria-hidden />
                {level}
              </span>
            )}
            {course.studentsCount > 0 && (
              <span className="hidden items-center gap-x-1 md:inline-flex">
                <Users className="h-3.5 w-3.5" aria-hidden />
                {course.studentsCount}
              </span>
            )}
            {course.category && <span className="hidden md:inline">{course.category}</span>}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {enrolled && (
              <span className="inline-flex items-center gap-x-1 rounded bg-success-50 px-1.5 py-0.5 text-2xs font-semibold text-success-700">
                <CheckCircle2 className="h-3 w-3" aria-hidden /> Enrolled
              </span>
            )}
            {isNew && !enrolled && (
              <span className="rounded bg-warning-100 px-1.5 py-0.5 text-2xs font-semibold text-warning-800">New</span>
            )}
          </div>
        </div>

        {/* Price / progress */}
        <div className="shrink-0 sm:w-28 sm:text-right">
          {enrolled ? (
            <div className="sm:pt-0.5">
              <p className="text-xs font-medium text-brand-700">
                {course.progress === 100 ? "Completed" : `${course.progress}% complete`}
              </p>
              <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-ink-200 sm:ml-auto">
                <div
                  className={cn("h-full rounded-full", course.progress === 100 ? "bg-success-500" : "bg-brand-600")}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-1.5 sm:flex-col sm:items-end">
              <p className={cn("text-base font-bold tabular-nums", free ? "text-success-700" : "text-ink-900")}>
                {free ? "Free" : formatPrice(course.currentPrice)}
              </p>
              {course.discountPct > 0 && (
                <>
                  <p className="text-xs text-ink-400 line-through tabular-nums">{formatPrice(course.originalPrice)}</p>
                  <p className="text-xs font-semibold text-danger-600">{course.discountPct}% off</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
