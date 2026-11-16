import Image from "next/image";
import Link from "next/link";
import { ImageIcon, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DashboardCourse } from "@/actions/get-dashboard-courses";
import { Heading } from "@/components/ui/typography";

/** Hero card that resumes the most recently active, unfinished course. */
export const ContinueLearning = ({ course }: { course: DashboardCourse }) => {
  const href = course.nextChapter
    ? `/courses/${course.id}/chapters/${course.nextChapter.id}`
    : `/courses/${course.id}`;
  const started = course.chaptersCompleted > 0;

  return (
    <section
      aria-labelledby="continue-heading"
      className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-video w-full shrink-0 bg-ink-100 sm:aspect-auto sm:w-64 lg:w-72">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 288px, (min-width: 640px) 256px, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center">
              <ImageIcon className="h-8 w-8 text-ink-300" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 sm:p-6">
          <div className="min-w-0">
            <p id="continue-heading" className="text-xs font-medium uppercase tracking-wide text-brand-700">
              {started ? "Continue learning" : "Start learning"}
            </p>
            <Heading as="h2" size="card" className="mt-1 line-clamp-2">{course.title}</Heading>
            {course.nextChapter && (
              <p className="mt-1 truncate text-sm text-ink-500">
                Up next: Chapter {course.nextChapter.position} · {course.nextChapter.title}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <div className="mb-1.5 flex justify-between text-xs text-ink-500">
                <span className="tabular-nums">
                  {course.chaptersCompleted} of {course.chaptersTotal} chapters
                </span>
                <span className="font-medium tabular-nums text-brand-700">{course.progress}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={course.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${course.title} progress`}
                className="h-2 overflow-hidden rounded-full bg-ink-100"
              >
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${course.progress}%` }} />
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href={href}>
                <PlayCircle className="mr-2 h-4 w-4" />
                {started ? "Resume" : "Start course"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
