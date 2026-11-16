import Link from "next/link";
import { Compass, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import type { DashboardCourse } from "@/actions/get-dashboard-courses";
import { Heading } from "@/components/ui/typography";

/** First-run state for a student with no enrolments: a clear next step + suggestions. */
export const DashboardEmpty = ({ recommended }: { recommended: DashboardCourse[] }) => (
  <div className="space-y-8">
    <section className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-ink-300 bg-white px-4 py-10 text-center sm:py-14">
      <div className="rounded-full bg-brand-100 p-3">
        <GraduationCap className="h-7 w-7 text-brand-700" aria-hidden />
      </div>
      <div className="max-w-md">
        <Heading as="h2" size="card">Start your learning journey</Heading>
        <p className="mt-1 text-sm text-ink-500">
          You haven&apos;t enrolled in any courses yet. Browse the catalogue. Many courses have free preview chapters.
        </p>
      </div>
      <Button asChild>
        <Link href="/search">
          <Compass className="mr-2 h-4 w-4" />
          Browse courses
        </Link>
      </Button>
    </section>

    {recommended.length > 0 && (
      <section aria-labelledby="recommended-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading as="h2" id="recommended-heading" size="card">
            Recommended for you
          </Heading>
          <Link href="/search" className="text-sm font-medium text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {recommended.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              imageUrl={course.imageUrl}
              chaptersLength={course.chaptersTotal}
              price={course.price}
              progress={null}
              category={course.category}
              code={course.code}
              level={course.level}
            />
          ))}
        </div>
      </section>
    )}
  </div>
);
