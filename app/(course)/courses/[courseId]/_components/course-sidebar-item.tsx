"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/duration";

interface CourseSidebarItemProps {
  label: string;
  id: string;
  index: number;
  duration?: number | null;
  isCompleted: boolean;
  courseId: string;
  isLocked: boolean;
  isFreePreview: boolean;
}

export const CourseSidebarItem = ({
  label,
  id,
  index,
  duration,
  isCompleted,
  courseId,
  isLocked,
  isFreePreview,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname?.endsWith(`/chapters/${id}`);

  const Icon = isLocked ? Lock : isCompleted ? CheckCircle2 : PlayCircle;
  const status = isLocked ? "Locked" : isCompleted ? "Completed" : isActive ? "Now playing" : "Not started";

  return (
    <li>
      <Link
        href={`/courses/${courseId}/chapters/${id}`}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group relative flex items-start gap-x-3 px-5 py-3 text-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600/40",
          isActive ? "bg-brand-50" : "hover:bg-ink-50"
        )}
      >
        {/* active indicator */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-0 w-1 rounded-r bg-brand-600 transition-opacity",
            isActive ? "opacity-100" : "opacity-0"
          )}
        />
        <Icon
          aria-hidden
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            isCompleted ? "text-success-600" : isActive ? "text-brand-700" : "text-ink-400",
            isLocked && "text-ink-300"
          )}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-2xs font-medium uppercase tracking-wider text-ink-400">
            Lecture {index}{formatClock(duration) && <span className="normal-case tracking-normal"> · {formatClock(duration)}</span>}
          </span>
          <span
            className={cn(
              "line-clamp-2 font-medium leading-snug",
              isActive ? "text-brand-900" : isLocked ? "text-ink-400" : "text-ink-700 group-hover:text-ink-900"
            )}
          >
            {label}
          </span>
          <span className="sr-only">, {status}</span>
        </span>
        {isFreePreview && (
          <span className="mt-0.5 shrink-0 rounded-full bg-highlight-50 px-2 py-0.5 text-3xs font-semibold uppercase tracking-wide text-highlight-700">
            Preview
          </span>
        )}
      </Link>
    </li>
  )
}
