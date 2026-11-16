import { auth } from "@clerk/nextjs";
import { taughtBy } from "@/lib/course-owner";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Subtitles, ChevronLeft, ChevronRight, Eye, FileText, Video } from "lucide-react";

import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { hasRichContent } from "@/lib/rich-text";

import { SetupSection } from "../../../../_components/setup-section";
import { SetupChecklist, ChecklistItem } from "../../../../_components/setup-checklist";
import { PublishControl } from "../../../../_components/publish-control";
import { ChapterDetailsForm } from "./_components/chapter-details-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { ChapterVideoForm } from "./_components/chapter-video-form";
import { ChapterCaptionsForm } from "./_components/chapter-captions-form";
import { getCaptionTracks } from "@/lib/mux";
import { Heading } from "@/components/ui/typography";

const hasText = hasRichContent;

const ChapterIdPage = async({
  params
}: {
  params: { courseId: string; chapterId: string }
}) => {
  const { userId } = auth();

  if(!userId) {
    return redirect("/");
  }

  const [chapter, course] = await Promise.all([
    db.chapter.findUnique({
      where: { id: params.chapterId, courseId: params.courseId },
      include: { muxData: true },
    }),
    db.course.findFirst({
      where: { id: params.courseId, ...taughtBy(userId) },
      select: {
        id: true,
        title: true,
        code: true,
        chapters: { select: { id: true, title: true }, orderBy: { position: "asc" } },
      },
    }),
  ]);

  if(!chapter || !course) {
    return redirect("/admin/courses");
  }

  const hasProcessedVideo = !!chapter.muxData?.playbackId;
  const captionTracks = chapter.muxData?.assetId ? await getCaptionTracks(chapter.muxData.assetId) : [];

  const index = course.chapters.findIndex((c) => c.id === chapter.id);
  const prev = index > 0 ? course.chapters[index - 1] : null;
  const next = course.chapters[index + 1] ?? null;

  const checklist: ChecklistItem[] = [
    { id: "details", label: "Chapter title", done: !!chapter.title.trim(), required: true },
    { id: "details", label: "Description", done: hasText(chapter.description), required: true },
    { id: "video", label: "Video uploaded", done: !!chapter.videoUrl, required: true },
    { id: "captions", label: "Captions", done: captionTracks.some((t) => t.status === "ready"), required: false },
    { id: "access", label: "Access decided", done: true, required: false },
  ];
  const missing = checklist.filter((i) => i.required && !i.done);
  const canPublish = missing.length === 0;
  const base = `/admin/courses/${course.id}/chapters`;

  return (
    <div className="pb-16">
      <div className="sticky top-[80px] z-20 border-b border-ink-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <Link
              href={`/admin/courses/${course.id}#curriculum`}
              className="inline-flex max-w-full items-center gap-x-1 text-xs font-medium text-ink-500 hover:text-ink-900"
            >
              <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {course.code ? `${course.code} · ` : ""}{course.title}
              </span>
            </Link>
            <div className="mt-0.5 flex min-w-0 items-center gap-x-2">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-brand-700">
                Chapter {index + 1}/{course.chapters.length}
              </span>
              <Heading size="card" className="truncate">{chapter.title}</Heading>
              <span
                className={cn(
                  "hidden shrink-0 items-center gap-x-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset sm:inline-flex",
                  chapter.isPublished ? "bg-success-50 text-success-700 ring-success-600/20" : "bg-ink-100 text-ink-600 ring-ink-500/20"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", chapter.isPublished ? "bg-success-500" : "bg-ink-400")} />
                {chapter.isPublished ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* quick chapter switcher (Moodle-style prev/next) */}
            <div className="hidden items-center md:flex">
              {prev ? (
                <Link href={`${base}/${prev.id}`} className="flex h-10 w-10 items-center justify-center rounded-l-md border border-ink-200 text-ink-600 hover:bg-ink-50" aria-label={`Previous chapter: ${prev.title}`} title={prev.title}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-l-md border border-ink-200 text-ink-300"><ChevronLeft className="h-4 w-4" /></span>
              )}
              {next ? (
                <Link href={`${base}/${next.id}`} className="-ml-px flex h-10 w-10 items-center justify-center rounded-r-md border border-ink-200 text-ink-600 hover:bg-ink-50" aria-label={`Next chapter: ${next.title}`} title={next.title}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="-ml-px flex h-10 w-10 items-center justify-center rounded-r-md border border-ink-200 text-ink-300"><ChevronRight className="h-4 w-4" /></span>
              )}
            </div>
            <PublishControl
              entity="chapter"
              isPublished={chapter.isPublished}
              canPublish={canPublish}
              missing={missing}
              baseUrl={`/api/courses/${course.id}/chapters/${chapter.id}`}
              afterDeleteHref={`/admin/courses/${course.id}#curriculum`}
              previewHref={`/courses/${course.id}/chapters/${chapter.id}`}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-6">
          <SetupSection
            id="details"
            icon={FileText}
            title="Chapter details"
            status={checklist[0].done && checklist[1].done ? "done" : "required"}
          >
            <ChapterDetailsForm courseId={course.id} chapterId={chapter.id} initialData={chapter} />
          </SetupSection>

          <SetupSection
            id="video"
            icon={Video}
            title="Lesson video"
            status={chapter.videoUrl ? "done" : "required"}
          >
            <ChapterVideoForm initialData={chapter} courseId={course.id} chapterId={chapter.id} />
          </SetupSection>

          <SetupSection
            id="captions"
            icon={Subtitles}
            title="Captions & subtitles"
            description="Shown with the CC button in the player."
            status={captionTracks.some((t) => t.status === "ready") ? "done" : "optional"}
          >
            <ChapterCaptionsForm
              courseId={course.id}
              chapterId={chapter.id}
              hasProcessedVideo={hasProcessedVideo}
              initialTracks={captionTracks}
            />
          </SetupSection>

          <SetupSection id="access" icon={Eye} title="Access">
            <ChapterAccessForm courseId={course.id} chapterId={chapter.id} initialData={chapter} />
          </SetupSection>

          {/* prev / next on small screens */}
          <nav aria-label="Chapter navigation" className="flex gap-3 md:hidden">
            {prev && (
              <Link href={`${base}/${prev.id}`} className="flex min-w-0 flex-1 items-center gap-x-2 rounded-xl border border-ink-200 bg-white p-3 text-sm">
                <ChevronLeft className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                <span className="truncate">{prev.title}</span>
              </Link>
            )}
            {next && (
              <Link href={`${base}/${next.id}`} className="flex min-w-0 flex-1 items-center justify-end gap-x-2 rounded-xl border border-ink-200 bg-white p-3 text-right text-sm">
                <span className="truncate">{next.title}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
              </Link>
            )}
          </nav>
        </div>

        <aside className="order-first lg:order-none">
          <div className="lg:sticky lg:top-[180px]">
            <SetupChecklist items={checklist} title="Chapter checklist" />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ChapterIdPage;
