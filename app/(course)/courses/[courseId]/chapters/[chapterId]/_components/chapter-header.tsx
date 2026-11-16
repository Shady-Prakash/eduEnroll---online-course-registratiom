import { CheckCircle2, Eye, Lock, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Heading } from "@/components/ui/typography";

interface ChapterHeaderProps {
  title: string;
  chapterNumber: number;
  chaptersTotal: number;
  isFree: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  isPurchased: boolean;
  action?: React.ReactNode;
}

const Pill = ({
  icon: Icon,
  children,
  className,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-x-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
      className
    )}
  >
    <Icon className="h-3.5 w-3.5" aria-hidden />
    {children}
  </span>
);

/** Chapter meta (position + status), title, and the primary action. */
export const ChapterHeader = ({
  title,
  chapterNumber,
  chaptersTotal,
  isFree,
  isCompleted,
  isLocked,
  isPurchased,
  action,
}: ChapterHeaderProps) => (
  <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          Chapter {chapterNumber}
          <span className="font-normal text-ink-400"> of {chaptersTotal}</span>
        </span>
        {isCompleted && (
          <Pill icon={CheckCircle2} className="bg-success-50 text-success-700 ring-success-600/20">
            Completed
          </Pill>
        )}
        {!isCompleted && isPurchased && (
          <Pill icon={PlayCircle} className="bg-brand-50 text-brand-700 ring-brand-600/20">
            In progress
          </Pill>
        )}
        {!isPurchased && isFree && (
          <Pill icon={Eye} className="bg-highlight-50 text-highlight-700 ring-highlight-600/20">
            Free preview
          </Pill>
        )}
        {isLocked && (
          <Pill icon={Lock} className="bg-warning-50 text-warning-800 ring-warning-600/20">
            Locked
          </Pill>
        )}
      </div>
      <Heading size="hero">
        {title}
      </Heading>
    </div>
    {action && <div className="w-full shrink-0 lg:w-auto">{action}</div>}
  </header>
);
