import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock, ImageIcon, PlayCircle, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DashboardCourse } from "@/actions/get-dashboard-courses";

const lastSeen = (date: Date | null) => {
  if (!date) return null;
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const cta = (c: DashboardCourse) => {
  const done = c.progress === 100;
  const started = c.chaptersCompleted > 0;
  return {
    href: c.nextChapter ? `/courses/${c.id}/chapters/${c.nextChapter.id}` : `/courses/${c.id}`,
    label: done ? "Review" : started ? "Continue" : "Start",
    icon: done ? RotateCcw : PlayCircle,
    done,
  };
};

const Thumb = ({ src, className, done }: { src: string | null; className?: string; done: boolean }) => (
  <div className={cn("relative aspect-video overflow-hidden bg-ink-100", className)}>
    {src ? (
      <Image src={src} alt="" fill sizes="(min-width: 1024px) 320px, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
    ) : (
      <div className="flex h-full items-center justify-center"><ImageIcon className="h-7 w-7 text-ink-300" aria-hidden /></div>
    )}
    {/* hover play affordance */}
    <span aria-hidden className="absolute inset-0 flex items-center justify-center bg-ink-950/0 opacity-0 transition group-hover:bg-ink-950/35 group-hover:opacity-100">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-lg">
        <PlayCircle className="h-6 w-6 text-ink-900" />
      </span>
    </span>
    {done && (
      <span className="absolute left-2 top-2 inline-flex items-center gap-x-1 rounded-full bg-success-600 px-2 py-0.5 text-2xs font-semibold text-white shadow">
        <CheckCircle2 className="h-3 w-3" aria-hidden /> Completed
      </span>
    )}
  </div>
);

const Progress = ({ c, compact = false }: { c: DashboardCourse; compact?: boolean }) => {
  const done = c.progress === 100;
  return (
    <div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-ink-100"
        role="progressbar"
        aria-valuenow={c.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${c.title} progress`}
      >
        <div className={cn("h-full rounded-full transition-all", done ? "bg-success-500" : "bg-brand-600")} style={{ width: `${Math.max(c.progress, c.progress > 0 ? 3 : 0)}%` }} />
      </div>
      <p className={cn("mt-1.5 flex items-center justify-between text-xs", compact && "mt-1")}>
        <span className="tabular-nums text-ink-500">
          {c.chaptersCompleted}/{c.chaptersTotal} lectures
        </span>
        <span className={cn("font-semibold tabular-nums", done ? "text-success-700" : "text-brand-700")}>{c.progress}%</span>
      </p>
    </div>
  );
};

/** Enrolled course: "where am I and what's next" first, in card or list layout. */
export const EnrolledCourseCard = ({ course: c, view }: { course: DashboardCourse; view: "grid" | "list" }) => {
  const action = cta(c);
  const ActionIcon = action.icon;
  const upNext = !action.done && c.nextChapter ? `Lecture ${c.nextChapter.position}: ${c.nextChapter.title}` : null;
  const seen = lastSeen(c.lastActivity);

  if (view === "list") {
    return (
      <div className="group relative flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-2.5 transition hover:border-brand-200 hover:shadow-md sm:gap-4 sm:p-3">
        <Thumb src={c.imageUrl} done={action.done} className="w-28 shrink-0 rounded-lg sm:w-44" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-x-2">
            {c.code && <span className="shrink-0 rounded bg-ink-900 px-1.5 py-0.5 text-3xs font-semibold tracking-wide text-white">{c.code}</span>}
            {c.category && <span className="hidden truncate text-xs text-ink-500 sm:inline">{c.category}</span>}
          </div>
          {/* Whole row is clickable via the stretched link on the title */}
          <Link href={action.href} className="mt-0.5 line-clamp-2 text-sm font-semibold text-ink-900 after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-500/40 group-hover:text-brand-800 sm:text-base">
            {c.title}
          </Link>
          {upNext && <p className="mt-0.5 hidden truncate text-xs text-ink-500 sm:block">Up next · {upNext}</p>}
          <div className="mt-2 max-w-md"><Progress c={c} compact /></div>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-2 md:flex">
          {seen && (
            <span className="inline-flex items-center gap-x-1 text-xs text-ink-400" suppressHydrationWarning>
              <Clock className="h-3.5 w-3.5" aria-hidden /> {seen}
            </span>
          )}
          <span className={cn("inline-flex h-9 items-center gap-x-1.5 rounded-md px-3.5 text-sm font-semibold transition", action.done ? "border border-ink-200 text-ink-700 group-hover:bg-ink-50" : "bg-ink-900 text-white group-hover:bg-ink-800")}>
            <ActionIcon className="h-4 w-4" aria-hidden /> {action.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Thumb src={c.imageUrl} done={action.done} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-w-0 items-center gap-x-2">
          {c.code && <span className="shrink-0 rounded bg-ink-900 px-1.5 py-0.5 text-3xs font-semibold tracking-wide text-white">{c.code}</span>}
          {c.category && <span className="truncate text-xs font-medium uppercase tracking-wide text-ink-500">{c.category}</span>}
        </div>
        <Link href={action.href} className="mt-1 line-clamp-2 font-semibold text-ink-900 after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-brand-500/40 group-hover:text-brand-800">
          {c.title}
        </Link>
        {upNext ? (
          <p className="mt-1 line-clamp-1 text-xs text-ink-500">Up next · {upNext}</p>
        ) : seen ? (
          <p className="mt-1 text-xs text-ink-500" suppressHydrationWarning>Last active {seen.toLowerCase()}</p>
        ) : null}
        <div className="mt-auto space-y-3 pt-4">
          <Progress c={c} />
          <span className={cn("flex h-9 w-full items-center justify-center gap-x-1.5 rounded-md text-sm font-semibold transition", action.done ? "border border-ink-200 text-ink-700 group-hover:bg-ink-50" : "bg-ink-900 text-white group-hover:bg-ink-800")}>
            <ActionIcon className="h-4 w-4" aria-hidden /> {action.label}
          </span>
        </div>
      </div>
    </div>
  );
};
