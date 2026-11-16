import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, BookOpen, CalendarDays, Check, ChevronRight, ImageIcon, PlayCircle, UserRound, Users } from "lucide-react";

import { getCourseDetails } from "@/actions/get-course-details";
import { levelLabel } from "@/lib/validations/course";
import { hasRichContent } from "@/lib/rich-text";
import { formatLength } from "@/lib/duration";
import { Preview } from "@/components/preview";
import { Logo } from "@/app/(dashboard)/_components/logo";
import { NavbarRoutes } from "@/components/navbar-routes";

import { EnrollPanel } from "./_components/enroll-panel";
import { CourseContent } from "./_components/course-content";
import { MobileEnrollBar } from "./_components/mobile-enroll-bar";
import { CheckoutStatus } from "./_components/checkout-status";
import { PreviewModal } from "./_components/preview-modal";
import { PlanPicker } from "./_components/plan-picker";
import { ReviewsSection } from "./_components/reviews-section";
import { InstructorsSection } from "./_components/instructors-section";
import { RatingLine } from "@/components/ui/stars";
import { PASS } from "@/lib/plans";
import { fulfillCheckoutSession } from "@/lib/checkout";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/typography";

const CourseIdPage = async ({
  params,
  searchParams,
}: {
  params: { courseId: string };
  searchParams: { preview?: string; pass?: string; session_id?: string };
}) => {
  const { userId } = auth();
  if (!userId) return redirect("/");

  // Back from Pass checkout: activate the subscription now instead of waiting for the webhook.
  if (searchParams.pass === "success" && searchParams.session_id) {
    try {
      await fulfillCheckoutSession(searchParams.session_id, userId);
    } catch (error) {
      console.log("[PASS_RETURN]", error);
    }
  }

  const course = await getCourseDetails(params.courseId, userId);
  if (!course) return redirect("/search");

  const level = levelLabel(course.level);
  const updated = new Date(course.updatedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const previewButton =
    course.previews.length > 0 ? (
      <PreviewModal
        courseId={course.id}
        courseTitle={course.title}
        price={course.pricing.current}
        isEnrolled={course.isEnrolled}
        previews={course.previews}
      >
        <Button variant="ghost" size="sm" className="w-full text-ink-600">
          <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
          Watch a free preview first
        </Button>
      </PreviewModal>
    ) : null;

  const panel = !course.isEnrolled ? (
    <div className="space-y-2">
      <PlanPicker
        courseId={course.id}
        pricing={course.pricing}
        pass={{ name: PASS.name, monthlyPrice: PASS.monthlyPrice, trialDays: PASS.trialDays }}
        publishedCount={course.publishedCount}
        hasActivePass={course.hasActivePass}
        passExpired={course.passExpired}
      />
      {previewButton}
    </div>
  ) : (
    <EnrollPanel
      courseId={course.id}
      price={course.pricing.current}
      isEnrolled={course.isEnrolled}
      progress={course.progress}
      chaptersCount={course.chapters.length}
      totalDuration={course.totalDuration}
      attachmentsCount={course.attachmentsCount}
      nextChapter={course.nextChapter}
      previewSlot={
        course.previews.length > 0 ? (
          <PreviewModal
            courseId={course.id}
            courseTitle={course.title}
            price={course.pricing.current}
            isEnrolled={course.isEnrolled}
            previews={course.previews}
          >
            <Button variant="outline" size="lg" className="w-full">
              <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
              Watch free preview
            </Button>
          </PreviewModal>
        ) : undefined
      }
    />
  );

  const cover = (
    <div className="relative aspect-video overflow-hidden bg-ink-800">
      {course.imageUrl ? (
        <Image src={course.imageUrl} alt="" fill priority sizes="(min-width: 1024px) 360px, 100vw" className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <ImageIcon className="h-10 w-10 text-ink-500" aria-hidden />
        </div>
      )}
      {course.previews.length > 0 && (
        <PreviewModal
          courseId={course.id}
          courseTitle={course.title}
          price={course.pricing.current}
          isEnrolled={course.isEnrolled}
          previews={course.previews}
        >
          <button
            type="button"
            className="group absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-950/40 text-white transition hover:bg-ink-950/55 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-400/60"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-900 shadow-lg transition group-hover:scale-105">
              <PlayCircle className="h-7 w-7" aria-hidden />
            </span>
            <span className="text-sm font-semibold">Preview this course</span>
            <span className="text-xs text-ink-200">
              {course.previews.length} free video{course.previews.length === 1 ? "" : "s"}
            </span>
          </button>
        </PreviewModal>
      )}
    </div>
  );

  return (
    <div className="min-h-full overflow-x-clip bg-ink-50 pb-28 md:pb-16">
      <CheckoutStatus enrolled={course.isEnrolled} />

      {/* Arrived from a free lecture link: play it right away in the preview player */}
      {!course.isEnrolled && course.previews.some((p) => p.id === searchParams.preview) && (
        <PreviewModal
          courseId={course.id}
          courseTitle={course.title}
          price={course.pricing.current}
          isEnrolled={false}
          previews={course.previews}
          initialId={searchParams.preview}
          defaultOpen
        >
          <span hidden />
        </PreviewModal>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-ink-200 bg-white px-4 sm:px-6">
        <Logo />
        <NavbarRoutes />
      </header>

      <div className="relative isolate mx-auto grid max-w-6xl gap-x-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Full-width dark band behind row 1. It spans BOTH columns, so it is centred on the
            page (not on the left column) and its height always matches the hero. */}
        <div aria-hidden className="relative -z-10 col-start-1 col-end-2 row-start-1 lg:col-end-3">
          <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-ink-900" />
        </div>

        {/* Hero (row 1) */}
        <section className="col-start-1 row-start-1 py-8 text-white lg:py-12">
          <div className="min-w-0 space-y-4">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-brand-200">
              <Link href="/search" className="hover:underline">Browse</Link>
              {course.category && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-500" aria-hidden />
                  <Link href={`/search?categoryId=${course.categoryId}`} className="hover:underline">{course.category}</Link>
                </>
              )}
            </nav>

            {(course.code || course.term || !course.isPublished) && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                {course.code && <span className="rounded bg-white px-2 py-0.5 font-semibold tracking-wide text-ink-900">{course.code}</span>}
                {course.term && <span className="rounded bg-white/10 px-2 py-0.5 text-ink-200 ring-1 ring-white/15">{course.term}</span>}
                {!course.isPublished && <span className="rounded bg-warning-400 px-2 py-0.5 font-semibold text-warning-950">Draft: only you can see this</span>}
              </div>
            )}

            <Heading size="hero" tone="inverse">{course.title}</Heading>
            {course.subtitle && <p className="text-base text-ink-300 sm:text-lg">{course.subtitle}</p>}

            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-300">
              {course.ratings.count > 0 && (
                <li>
                  <a href="#reviews-heading" className="hover:underline">
                    <RatingLine average={course.ratings.average} count={course.ratings.count} showCountLabel className="text-warning-300 [&>span:last-child]:text-ink-300" />
                  </a>
                </li>
              )}
              {course.instructors.length > 0 && (
                <li className="flex items-center gap-x-1.5">
                  <UserRound className="h-4 w-4 text-ink-400" aria-hidden />
                  Created by{" "}
                  {course.instructors.map((t, i) => (
                    <span key={t.id}>
                      {i > 0 && ", "}
                      <Link href={`/instructors/${t.id}`} className="text-brand-200 underline underline-offset-2 hover:text-white">
                        {t.name}
                      </Link>
                    </span>
                  ))}
                </li>
              )}
              <li className="flex items-center gap-x-1.5">
                <BookOpen className="h-4 w-4 text-ink-400" aria-hidden />
                {course.chapters.length} lectures
                {formatLength(course.totalDuration) && <> • {formatLength(course.totalDuration)}</>}
              </li>
              {level && (
                <li className="flex items-center gap-x-1.5">
                  <BarChart3 className="h-4 w-4 text-ink-400" aria-hidden />
                  {level}
                </li>
              )}
              {course.studentsCount > 0 && (
                <li className="flex items-center gap-x-1.5">
                  <Users className="h-4 w-4 text-ink-400" aria-hidden />
                  {course.studentsCount} student{course.studentsCount === 1 ? "" : "s"}
                </li>
              )}
              <li className="flex items-center gap-x-1.5">
                <CalendarDays className="h-4 w-4 text-ink-400" aria-hidden />
                Updated {updated}
              </li>
            </ul>

            {/* Mobile/tablet: cover + enroll inline (desktop uses the sticky card) */}
            <div className="overflow-hidden rounded-xl bg-white text-ink-900 shadow-xl lg:hidden">
              {cover}
              <div className="p-4 sm:p-5">{panel}</div>
            </div>
          </div>
        </section>

        {/* Desktop: purchase card spans hero + content and stays in view while scrolling */}
        <aside className="hidden pt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
          <div className="sticky top-20 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl">
            {cover}
            <div className="p-5">{panel}</div>
          </div>
        </aside>

        {/* Content (row 2) */}
        <div className="col-start-1 row-start-2 min-w-0 space-y-10 pt-8">
          {course.outcomes.length > 0 && (
            <section aria-labelledby="learn-heading" className="rounded-xl border border-ink-200 bg-white p-5 sm:p-6">
              <Heading as="h2" id="learn-heading" size="section">What you&apos;ll learn</Heading>
              <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm text-ink-700 md:grid-cols-2">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-x-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden />
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <CourseContent
            courseId={course.id}
            courseTitle={course.title}
            price={course.pricing.current}
            isEnrolled={course.isEnrolled}
            sections={course.sections}
            totalDuration={course.totalDuration}
            previews={course.previews}
          />

          {hasRichContent(course.description) && (
            <section aria-labelledby="desc-heading" className="space-y-3">
              <Heading as="h2" id="desc-heading" size="section">Description</Heading>
              <div className="chapter-prose rounded-xl border border-ink-200 bg-white px-1 py-1 sm:px-2">
                <Preview value={course.description!} />
              </div>
            </section>
          )}

          <InstructorsSection instructors={course.instructors} code={course.code} />

          <ReviewsSection
            courseId={course.id}
            ratings={course.ratings}
            reviews={course.reviews}
            myReview={course.myReview}
            canReview={course.canReview}
          />
        </div>

      </div>

      <MobileEnrollBar
        courseId={course.id}
        title={course.title}
        price={course.pricing.current}
        originalPrice={course.pricing.onSale ? course.pricing.original : undefined}
        isEnrolled={course.isEnrolled}
        nextChapterId={course.nextChapter?.id}
        passMonthly={course.hasActivePass ? undefined : PASS.monthlyPrice}
      />
    </div>
  );
};

export default CourseIdPage;
