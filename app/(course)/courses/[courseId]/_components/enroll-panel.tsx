import Link from "next/link";
import { BookOpen, CheckCircle2, Infinity as InfinityIcon, Paperclip, PlayCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { formatLength } from "@/lib/duration";
import { CourseEnrollButton } from "./course-enroll-button";

export const priceLabel = (price: number | null) => (!price || price <= 0 ? "Free" : formatPrice(price));

interface EnrollPanelProps {
  courseId: string;
  price: number | null;
  isEnrolled: boolean;
  progress: number;
  chaptersCount: number;
  totalDuration?: number;
  attachmentsCount: number;
  nextChapter: { id: string; title: string } | null;
  /** Optional "Watch free preview" control (e.g. a modal trigger). */
  previewSlot?: React.ReactNode;
  /** "full" on the course page; "compact" at the bottom of the chapter sidebar. */
  variant?: "full" | "compact";
  className?: string;
}

/**
 * The one place a student enrolls (like Udemy's purchase box).
 * Enrolled students see their progress and a Continue button instead.
 */
export const EnrollPanel = ({
  courseId,
  price,
  isEnrolled,
  progress,
  chaptersCount,
  totalDuration,
  attachmentsCount,
  nextChapter,
  previewSlot,
  variant = "full",
  className,
}: EnrollPanelProps) => {
  const isFree = !price || price <= 0;
  const compact = variant === "compact";

  if (isEnrolled) {
    return (
      <div className={cn("space-y-3", className)}>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-ink-700">Your progress</span>
            <span className="font-semibold tabular-nums text-brand-700">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
            <div className={cn("h-full rounded-full", progress === 100 ? "bg-success-500" : "bg-brand-600")} style={{ width: `${progress}%` }} />
          </div>
        </div>
        {nextChapter && (
          <Button asChild size="lg" className="w-full">
            <Link href={`/courses/${courseId}/chapters/${nextChapter.id}`}>
              <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
              {progress === 0 ? "Start learning" : progress === 100 ? "Review course" : "Continue learning"}
            </Link>
          </Button>
        )}
        {!compact && nextChapter && progress > 0 && progress < 100 && (
          <p className="truncate text-center text-xs text-ink-500">Up next: {nextChapter.title}</p>
        )}
      </div>
    );
  }

  const perks = [
    ...(formatLength(totalDuration) ? [{ icon: PlayCircle, text: `${formatLength(totalDuration)} of on-demand video` }] : []),
    { icon: BookOpen, text: `${chaptersCount} lecture${chaptersCount === 1 ? "" : "s"}` },
    ...(attachmentsCount ? [{ icon: Paperclip, text: `${attachmentsCount} downloadable resource${attachmentsCount === 1 ? "" : "s"}` }] : []),
    { icon: CheckCircle2, text: "Progress tracking" },
    { icon: InfinityIcon, text: "Lifetime access" },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline gap-x-2">
        <p className={cn("font-bold tabular-nums text-ink-900", compact ? "text-xl" : "text-3xl")}>{priceLabel(price)}</p>
        {!isFree && <span className="text-xs text-ink-500">one-time</span>}
      </div>
      <CourseEnrollButton courseId={courseId} price={price} size={compact ? "default" : "lg"} className="w-full md:w-full" />
      {!compact && previewSlot}
      {compact ? (
        <Link href={`/courses/${courseId}`} className="block text-center text-xs font-medium text-brand-700 hover:underline">
          View course details
        </Link>
      ) : (
        <>
          <p className="flex items-center justify-center gap-x-1 text-xs text-ink-500">
            <ShieldCheck className="h-3.5 w-3.5 text-success-600" aria-hidden />
            {isFree ? "Free enrolment, no card needed" : "Secure checkout with Stripe"}
          </p>
          <div className="border-t border-ink-100 pt-3">
            <p className="text-sm font-semibold text-ink-900">This course includes</p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-600">
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-x-2">
                  <Icon className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
