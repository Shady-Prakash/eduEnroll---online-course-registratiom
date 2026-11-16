import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, FileText, Lock } from "lucide-react";

import { getChapter } from "@/actions/get-chapter";
import { Preview } from "@/components/preview";
import { fulfillCheckoutSession } from "@/lib/checkout";
import { hasRichContent } from "@/lib/rich-text";

import { VideoPlayer } from "./_components/video-player";
import { PlayerStage } from "./_components/player-stage";
import { CourseProgressButton } from "./_components/course-progress-button";
import { CheckoutStatus } from "../../_components/checkout-status";
import { MobileEnrollBar } from "../../_components/mobile-enroll-bar";
import { ChapterHeader } from "./_components/chapter-header";
import { ChapterNav } from "./_components/chapter-nav";
import { ChapterResources } from "./_components/chapter-resources";
import { Heading } from "@/components/ui/typography";

const ChapterIdPage = async ({
  params,
  searchParams,
}: {
  params: {
    courseId: string;
    chapterId: string;
  };
  searchParams: {
    checkout?: string;
    session_id?: string;
  };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const load = () => getChapter({
    userId,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  let data = await load();

  // Returning from Stripe: grant access right away instead of waiting for the webhook.
  if (searchParams.checkout === "success" && searchParams.session_id && !data.purchase) {
    try {
      const result = await fulfillCheckoutSession(searchParams.session_id, userId);
      if (result === "fulfilled") data = await load();
    } catch (error) {
      console.log("[CHECKOUT_RETURN]", error);
    }
  }

  const {
    chapter,
    course,
    muxData,
    attachments,
    nextChapter,
    prevChapter,
    chapterNumber,
    chaptersTotal,
    userProgress,
    purchase,
  } = data;

  if (!chapter || !course) {
    return redirect("/");
  }

  const isPurchased = !!purchase;

  // Lecture pages are for students with access (purchase or active Pass) and the course's teachers.
  // Everyone else watches free previews in the course page's preview player.
  if (!isPurchased) {
    return redirect(
      chapter.isFree ? `/courses/${params.courseId}?preview=${chapter.id}` : `/courses/${params.courseId}`
    );
  }
  const isCompleted = !!userProgress?.isCompleted;
  const isLocked = !chapter.isFree && !isPurchased;
  const completeOnEnd = isPurchased && !isCompleted;
  const hasDescription = hasRichContent(chapter.description);

  return (
    <div className={isPurchased ? "pb-16" : "pb-32 md:pb-16"}>
      <CheckoutStatus enrolled={isPurchased} />

      {/* Video stage: edge-to-edge on phones, framed on larger screens, optional theater mode */}
      <PlayerStage>
        <VideoPlayer
          chapterId={params.chapterId}
          title={chapter.title}
          courseId={params.courseId}
          nextChapterId={nextChapter?.id}
          nextChapterTitle={nextChapter?.title}
          nextLocked={!!nextChapter && !isPurchased && !nextChapter.isFree}
          playbackId={muxData?.playbackId ?? ""}
          isLocked={isLocked}
          completeOnEnd={completeOnEnd}
        />
      </PlayerStage>

      <div className="mx-auto max-w-5xl space-y-8 px-4 pt-6 md:px-6">
        <ChapterHeader
          title={chapter.title}
          chapterNumber={chapterNumber}
          chaptersTotal={chaptersTotal}
          isFree={chapter.isFree}
          isCompleted={isCompleted}
          isLocked={isLocked}
          isPurchased={isPurchased}
          action={
            isPurchased ? (
              <CourseProgressButton
                chapterId={params.chapterId}
                courseId={params.courseId}
                nextChapterId={nextChapter?.id}
                isCompleted={isCompleted}
              />
            ) : undefined
          }
        />

        {/* Not enrolled: a quiet pointer to the course page. Enrolling happens in ONE place
            (course page / sidebar / mobile bar), not on every chapter. */}
        {!isPurchased && (
          <Link
            href={`/courses/${params.courseId}`}
            className="group flex items-center gap-x-3 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm transition hover:border-brand-300 hover:bg-brand-50/40"
          >
            <span className={isLocked ? "text-warning-600" : "text-highlight-600"}>
              {isLocked ? <Lock className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </span>
            <span className="min-w-0 flex-1 text-ink-600">
              {isLocked ? "This chapter is part of the full course." : "You're watching a free preview."}{" "}
              <span className="font-medium text-ink-900">
                See what&apos;s included in {course.code ?? "the course"}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" aria-hidden />
          </Link>
        )}

        <section aria-labelledby="about-heading" className="space-y-3">
          <Heading as="h2" id="about-heading" size="sub" className="flex items-center gap-x-2">
            <FileText className="h-4 w-4 text-ink-400" aria-hidden />
            About this chapter
          </Heading>
          {hasDescription ? (
            <div className="chapter-prose rounded-xl border border-ink-200 bg-white px-1 py-1 sm:px-2">
              <Preview value={chapter.description!} />
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-ink-200 p-4 text-sm text-ink-500">
              No description for this chapter yet.
            </p>
          )}
        </section>

        {isPurchased && <ChapterResources attachments={attachments} />}

        <ChapterNav
          courseId={params.courseId}
          prev={prevChapter}
          next={nextChapter}
          isPurchased={isPurchased}
        />
      </div>

      {!isPurchased && (
        <MobileEnrollBar
          courseId={params.courseId}
          title={course.title}
          price={course.price}
          isEnrolled={false}
        />
      )}
    </div>
  );
}

export default ChapterIdPage;
