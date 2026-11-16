import Link from "next/link";
import { ArrowLeft, Info, Trophy } from "lucide-react";

import { CourseSidebarItem } from "./course-sidebar-item";
import { EnrollPanel } from "./enroll-panel";
import { formatLength } from "@/lib/duration";
import type { CourseWithChapters } from "./types";
import { Heading } from "@/components/ui/typography";

interface CourseSidebarProps {
  course: CourseWithChapters;
  progressCount: number;
  isPurchased: boolean;
};

export const CourseSidebar = ({
  course,
  progressCount,
  isPurchased,
}: CourseSidebarProps) => {
  const total = course.chapters.length;
  const completed = course.chapters.filter((ch) => ch.userProgress?.[0]?.isCompleted).length;
  const pct = Math.round(progressCount);
  const done = isPurchased && total > 0 && completed === total;

  // Group lectures by section (lectures without a section first, as "General").
  const sections = course.sections ?? [];
  const known = new Set(sections.map((s) => s.id));
  const groups = [
    { id: "general", title: sections.length ? "General" : "Lectures", chapters: course.chapters.filter((c) => !c.sectionId || !known.has(c.sectionId)) },
    ...sections.map((s) => ({ id: s.id, title: s.title, chapters: course.chapters.filter((c) => c.sectionId === s.id) })),
  ]
    .filter((g) => g.chapters.length)
    .map((g) => ({
      ...g,
      done: g.chapters.filter((c) => c.userProgress?.[0]?.isCompleted).length,
      duration: g.chapters.reduce((sum, c) => sum + (c.duration ?? 0), 0),
    }));
  // Lecture numbers follow the grouped (displayed) order.
  const numberOf = new Map(groups.flatMap((g) => g.chapters).map((c, i) => [c.id, i + 1]));

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-ink-200 bg-white">
      <div className="space-y-4 border-b border-ink-200 p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-medium">
          <Link href="/" className="inline-flex items-center gap-x-1 text-ink-500 transition hover:text-ink-900">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Dashboard
          </Link>
          <Link href={`/courses/${course.id}`} className="inline-flex items-center gap-x-1 text-brand-700 hover:underline">
            <Info className="h-3.5 w-3.5" aria-hidden />
            Course details
          </Link>
        </div>
        <div className="space-y-1.5">
          {(course.code || course.term) && (
            <div className="flex flex-wrap items-center gap-1.5 text-2xs font-medium">
              {course.code && (
                <span className="rounded bg-ink-900 px-1.5 py-0.5 tracking-wide text-white">{course.code}</span>
              )}
              {course.term && <span className="text-ink-500">{course.term}</span>}
            </div>
          )}
          <Heading as="h2" size="sub" className="line-clamp-3">
            {course.title}
          </Heading>
        </div>

        {isPurchased ? (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-ink-500 tabular-nums">
                {completed} of {total} completed
              </span>
              <span className={done ? "font-semibold text-success-700" : "font-semibold text-brand-700"}>
                {pct}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Course progress"
              className="h-2 overflow-hidden rounded-full bg-ink-100"
            >
              <div
                className={done ? "h-full rounded-full bg-success-500" : "h-full rounded-full bg-brand-600"}
                style={{ width: `${pct}%` }}
              />
            </div>
            {done && (
              <p className="mt-2 flex items-center gap-x-1.5 text-xs font-medium text-success-700">
                <Trophy className="h-3.5 w-3.5" aria-hidden />
                Course completed
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-ink-500">
            {total} chapter{total === 1 ? "" : "s"} · Free previews are unlocked
          </p>
        )}
      </div>

      <nav aria-label="Course chapters" className="flex-1 overflow-y-auto py-2">
        {groups.map((group) => (
          <div key={group.id}>
            {groups.length > 1 || group.id !== "general" ? (
              <div className="sticky top-0 z-10 flex items-baseline justify-between gap-2 border-y border-ink-100 bg-ink-50/95 px-5 py-2 backdrop-blur first:border-t-0">
                <p className="truncate text-xs font-semibold text-ink-700">{group.title}</p>
                <p className="shrink-0 text-2xs text-ink-400 tabular-nums">
                  {group.done}/{group.chapters.length}
                  {formatLength(group.duration) && <> · {formatLength(group.duration)}</>}
                </p>
              </div>
            ) : null}
            <ol>
              {group.chapters.map((chapter) => (
                <CourseSidebarItem
                  key={chapter.id}
                  id={chapter.id}
                  index={numberOf.get(chapter.id)!}
                  label={chapter.title}
                  duration={chapter.duration}
                  isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                  courseId={course.id}
                  isLocked={!chapter.isFree && !isPurchased}
                  isFreePreview={chapter.isFree && !isPurchased}
                />
              ))}
            </ol>
          </div>
        ))}
      </nav>

      {/* Fixed enroll block: the same price/CTA on every chapter, always in the same place */}
      {!isPurchased && (
        <div className="border-t border-ink-200 bg-ink-50/80 p-4">
          <EnrollPanel
            variant="compact"
            courseId={course.id}
            price={course.price}
            isEnrolled={false}
            progress={0}
            chaptersCount={total}
            attachmentsCount={0}
            nextChapter={null}
          />
        </div>
      )}
    </div>
  )
}
