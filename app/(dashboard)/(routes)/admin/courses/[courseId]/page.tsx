import { auth } from "@clerk/nextjs";
import { taughtBy } from "@/lib/course-owner";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  DollarSign,
  FileText,
  ImageIcon,
  LayoutTemplate,
  ListOrdered,
  Paperclip,
  Target,
  Users,
} from "lucide-react";

import { db } from "@/lib/db";
import { getCourseReadiness } from "@/lib/course-readiness";
import { ensureChapterDurations } from "@/lib/mux";
import { parseOutcomes } from "@/lib/validations/course";
import { cn } from "@/lib/utils";

import { SetupSection } from "../../_components/setup-section";
import { SetupChecklist } from "../../_components/setup-checklist";
import { PublishControl } from "../../_components/publish-control";
import { BasicsForm } from "./_components/basics-form";
import { DescriptionForm } from "./_components/description-form";
import { OutcomesForm } from "./_components/outcomes-form";
import { ImageForm } from "./_components/image-form";
import { PriceForm } from "./_components/price-form";
import { ChaptersForm } from "./_components/chapters-form";
import { AttachmentForm } from "./_components/attachment-form";
import { InstructorsForm, TeacherRow } from "./_components/instructors-form";
import { getUserProfiles } from "@/lib/clerk-users";
import { Heading } from "@/components/ui/typography";

const sections = [
  { id: "basics", label: "Basics" },
  { id: "description", label: "Description" },
  { id: "outcomes", label: "Outcomes" },
  { id: "media", label: "Cover image" },
  { id: "curriculum", label: "Curriculum" },
  { id: "pricing", label: "Pricing" },
  { id: "resources", label: "Resources" },
  { id: "teachers", label: "Teachers" },
];

const CourseIdPage = async ({
  params
}: {
  params: { courseId: string }
}) => {
  const { userId } = auth();

  if(!userId) {
    return redirect("/");
  }

  const [course, categories] = await Promise.all([
    db.course.findFirst({
      where: { id: params.courseId, ...taughtBy(userId) },
      include: {
        chapters: { orderBy: { position: "asc" }, include: { muxData: { select: { assetId: true } } } },
        sections: { orderBy: { position: "asc" }, select: { id: true, title: true } },
        attachments: { orderBy: { createdAt: "desc" } },
        instructors: { select: { userId: true }, orderBy: { createdAt: "asc" } },
        _count: { select: { purchases: true } },
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if(!course) {
    return redirect("/admin/courses");
  }

  // Fill in video lengths from Mux (once per video) so totals show in the curriculum.
  const durations = await ensureChapterDurations(course.chapters);
  const boardChapters = course.chapters.map((c) => ({
    id: c.id,
    title: c.title,
    isPublished: c.isPublished,
    isFree: c.isFree,
    videoUrl: c.videoUrl,
    duration: durations.get(c.id) ?? null,
    sectionId: c.sectionId,
  }));

  const viewerRole: "owner" | "co" = course.userId === userId ? "owner" : "co";
  const teacherIds = [course.userId, ...course.instructors.map((i) => i.userId)];
  const profiles = await getUserProfiles(teacherIds);
  const teachers: TeacherRow[] = teacherIds.map((id) => ({
    userId: id,
    name: profiles.get(id)?.name ?? "Teacher",
    email: profiles.get(id)?.email ?? null,
    imageUrl: profiles.get(id)?.imageUrl ?? null,
    role: id === course.userId ? "owner" : "co",
    isYou: id === userId,
  }));

  const readiness = getCourseReadiness(course);
  const outcomes = parseOutcomes(course.outcomes);
  const done = (id: string) => readiness.items.filter((i) => i.id === id && i.required).every((i) => i.done);
  const statusFor = (id: string, required: boolean) =>
    done(id) && (required || readiness.items.some((i) => i.id === id && i.done)) ? "done" : required ? "required" : "optional";

  return (
    <div className="pb-16">
      {/* Sticky header: context, status, primary actions */}
      <div className="sticky top-[80px] z-20 border-b border-ink-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <Link href="/admin/courses" className="inline-flex items-center gap-x-1 text-xs font-medium text-ink-500 hover:text-ink-900">
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> All courses
            </Link>
            <div className="mt-0.5 flex min-w-0 items-center gap-x-2">
              {course.code && (
                <span className="shrink-0 rounded-md bg-ink-900 px-1.5 py-0.5 text-2xs font-semibold tracking-wide text-white">
                  {course.code}
                </span>
              )}
              <Heading size="card" className="truncate">{course.title}</Heading>
              <span
                className={cn(
                  "hidden shrink-0 items-center gap-x-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset sm:inline-flex",
                  course.isPublished ? "bg-success-50 text-success-700 ring-success-600/20" : "bg-ink-100 text-ink-600 ring-ink-500/20"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", course.isPublished ? "bg-success-500" : "bg-ink-400")} />
                {course.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-500">
              {readiness.requiredDone}/{readiness.requiredTotal} required steps
              {course._count.purchases > 0 && <> · {course._count.purchases} enrolled</>}
            </p>
          </div>
          {viewerRole === "owner" ? (
            <PublishControl
              entity="course"
              isPublished={course.isPublished}
              canPublish={readiness.canPublish}
              missing={readiness.missing}
              baseUrl={`/api/courses/${course.id}`}
              afterDeleteHref="/admin/courses"
              previewHref={`/courses/${course.id}`}
            />
          ) : (
            <span className="inline-flex items-center gap-x-1.5 rounded-full bg-highlight-50 px-3 py-1.5 text-xs font-semibold text-highlight-700">
              Co-teaching · the owner publishes
            </span>
          )}
        </div>

        {/* Mobile/tablet section tabs */}
        <nav aria-label="Course setup sections" className="border-t border-ink-100 lg:hidden">
          <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <a href={`#${s.id}`} className="block rounded-full px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          {!course.isPublished && readiness.canPublish && (
            <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-900">
              🎉 Everything required is done. Hit <strong>Publish</strong> to open enrolments.
            </div>
          )}

          <SetupSection
            id="basics"
            icon={LayoutTemplate}
            title="Course basics"
            description="How your course appears in the catalogue."
            status={statusFor("basics", true)}
          >
            <BasicsForm courseId={course.id} initialData={course} categories={categories} />
          </SetupSection>

          <SetupSection
            id="description"
            icon={FileText}
            title="Description"
            description="The full overview students read before enrolling."
            status={statusFor("description", true)}
          >
            <DescriptionForm courseId={course.id} initialData={course} />
          </SetupSection>

          <SetupSection
            id="outcomes"
            icon={Target}
            title="What students will learn"
            description="Learning outcomes, shown as a checklist on the course page."
            status={outcomes.length >= 2 ? "done" : "optional"}
          >
            <OutcomesForm courseId={course.id} initialOutcomes={outcomes} />
          </SetupSection>

          <SetupSection
            id="media"
            icon={ImageIcon}
            title="Cover image"
            status={statusFor("media", true)}
          >
            <ImageForm courseId={course.id} initialData={course} />
          </SetupSection>

          <SetupSection
            id="curriculum"
            icon={ListOrdered}
            title="Curriculum"
            description="Sections and lectures in the order students take them. Publish at least one lecture."
            status={statusFor("curriculum", true)}
          >
            <ChaptersForm courseId={course.id} sections={course.sections} chapters={boardChapters} />
          </SetupSection>

          <SetupSection
            id="pricing"
            icon={DollarSign}
            title="Pricing"
            status={statusFor("pricing", true)}
          >
            <PriceForm courseId={course.id} initialData={course} readOnly={viewerRole !== "owner"} />
          </SetupSection>

          <SetupSection
            id="resources"
            icon={Paperclip}
            title="Resources"
            description="Downloadable files for enrolled students."
            status={course.attachments.length ? "done" : "optional"}
          >
            <AttachmentForm courseId={course.id} attachments={course.attachments} />
          </SetupSection>

          <SetupSection
            id="teachers"
            icon={Users}
            title="Teachers"
            description="Teach collaboratively: every teacher appears on the course page with their rating."
            status={teachers.length > 1 ? "done" : "optional"}
          >
            <InstructorsForm courseId={course.id} teachers={teachers} viewerRole={viewerRole} />
          </SetupSection>
        </div>

        <aside className="order-first lg:order-none">
          <div className="space-y-4 lg:sticky lg:top-[184px]">
            <details className="group lg:hidden" open={!readiness.canPublish}>
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-900 shadow-sm">
                Setup checklist
                <span className="tabular-nums text-ink-500">
                  {readiness.requiredDone}/{readiness.requiredTotal} · tap to {" "}
                  <span className="group-open:hidden">expand</span>
                  <span className="hidden group-open:inline">collapse</span>
                </span>
              </summary>
              <div className="mt-2">
                <SetupChecklist items={readiness.items} />
              </div>
            </details>
            <div className="hidden lg:block">
              <SetupChecklist items={readiness.items} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CourseIdPage;
