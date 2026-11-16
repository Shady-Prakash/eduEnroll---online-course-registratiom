"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Lock, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatClock, formatLength } from "@/lib/duration";
import { PreviewModal } from "./preview-modal";
import { Heading } from "@/components/ui/typography";

type Lecture = {
  id: string;
  title: string;
  isFree: boolean;
  isCompleted: boolean;
  duration: number | null;
  excerpt: string | null;
};
type Section = { id: string; title: string; duration: number; chapters: Lecture[] };
type PreviewVideo = { id: string; title: string; playbackId: string };

interface CourseContentProps {
  courseId: string;
  courseTitle: string;
  price: number | null;
  isEnrolled: boolean;
  sections: Section[];
  totalDuration: number;
  previews: PreviewVideo[];
}

/** Udemy-style "Course content": sections accordion → lectures (with optional descriptions). */
export const CourseContent = ({
  courseId,
  courseTitle,
  price,
  isEnrolled,
  sections,
  totalDuration,
  previews,
}: CourseContentProps) => {
  // First section open by default, like Udemy.
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(sections[0] ? [sections[0].id] : []));
  const [openLectures, setOpenLectures] = useState<Set<string>>(new Set());

  const lectureCount = sections.reduce((n, s) => n + s.chapters.length, 0);
  const allOpen = sections.length > 0 && openSections.size === sections.length;
  const previewIds = new Set(previews.map((p) => p.id));
  const showSectionHeaders = sections.length > 1 || sections[0]?.id !== "general";

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  };

  return (
    <section aria-labelledby="content-heading" className="space-y-3">
      <Heading as="h2" id="content-heading" size="section">Course content</Heading>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-600">
        <p className="tabular-nums">
          {showSectionHeaders && <>{sections.length} section{sections.length === 1 ? "" : "s"} • </>}
          {lectureCount} lecture{lectureCount === 1 ? "" : "s"}
          {formatLength(totalDuration) && <> • {formatLength(totalDuration)} total length</>}
        </p>
        {showSectionHeaders && sections.length > 1 && (
          <button
            type="button"
            onClick={() => setOpenSections(allOpen ? new Set() : new Set(sections.map((s) => s.id)))}
            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            {allOpen ? "Collapse all sections" : "Expand all sections"}
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
        {sections.map((section, sIndex) => {
          const isOpen = !showSectionHeaders || openSections.has(section.id);
          const done = section.chapters.filter((c) => c.isCompleted).length;
          const panelId = `section-panel-${section.id}`;

          return (
            <div key={section.id} className={cn(sIndex > 0 && "border-t border-ink-200")}>
              {showSectionHeaders && (
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenSections((s) => toggle(s, section.id))}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center gap-3 bg-ink-50 px-4 py-3.5 text-left transition hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/40 sm:px-5"
                  >
                    <ChevronDown
                      className={cn("h-4 w-4 shrink-0 text-ink-500 transition-transform", !isOpen && "-rotate-90")}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink-900 sm:text-base">{section.title}</span>
                    <span className="shrink-0 text-xs text-ink-500 tabular-nums sm:text-sm">
                      {isEnrolled ? `${done}/${section.chapters.length}` : `${section.chapters.length} lecture${section.chapters.length === 1 ? "" : "s"}`}
                      {formatLength(section.duration) && <> • {formatLength(section.duration)}</>}
                    </span>
                  </button>
                </h3>
              )}

              {isOpen && (
                <ul id={panelId} className="divide-y divide-ink-100">
                  {section.chapters.map((lecture) => {
                    // Only enrolled students open lecture pages. Others can play free previews in the modal.
                    const canOpen = isEnrolled;
                    const hasPreview = !isEnrolled && previewIds.has(lecture.id);
                    const expanded = openLectures.has(lecture.id);
                    const Icon = lecture.isCompleted ? CheckCircle2 : canOpen || hasPreview ? PlayCircle : Lock;
                    const clock = formatClock(lecture.duration);

                    return (
                      <li key={lecture.id} className="px-4 py-3 sm:px-5">
                        <div className="flex items-start gap-3">
                          <Icon
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0",
                              lecture.isCompleted ? "text-success-600" : canOpen || hasPreview ? "text-ink-500" : "text-ink-300"
                            )}
                            aria-hidden
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                              {canOpen ? (
                                <Link
                                  href={`/courses/${courseId}/chapters/${lecture.id}`}
                                  className="text-sm text-brand-800 hover:underline"
                                >
                                  {lecture.title}
                                </Link>
                              ) : (
                                <span className="text-sm text-ink-700">{lecture.title}</span>
                              )}
                              {lecture.excerpt && (
                                <button
                                  type="button"
                                  onClick={() => setOpenLectures((s) => toggle(s, lecture.id))}
                                  aria-expanded={expanded}
                                  aria-label={expanded ? "Hide lecture description" : "Show lecture description"}
                                  className="mt-0.5 shrink-0 rounded p-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                                >
                                  <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                                </button>
                              )}
                            </div>
                            {expanded && lecture.excerpt && (
                              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{lecture.excerpt}</p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-3 text-sm">
                            {hasPreview && (
                              <PreviewModal
                                courseId={courseId}
                                courseTitle={courseTitle}
                                price={price}
                                isEnrolled={isEnrolled}
                                previews={previews}
                                initialId={lecture.id}
                              >
                                <button type="button" className="font-medium text-brand-700 underline-offset-2 hover:underline">
                                  Preview
                                </button>
                              </PreviewModal>
                            )}
                            {!hasPreview && !isEnrolled && lecture.isFree && (
                              <span className="text-xs font-medium text-highlight-700">Free</span>
                            )}
                            <span className="w-12 text-right text-ink-500 tabular-nums">{clock ?? ""}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
