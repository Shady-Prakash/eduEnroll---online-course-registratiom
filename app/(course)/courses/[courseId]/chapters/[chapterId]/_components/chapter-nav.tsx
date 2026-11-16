import Link from "next/link";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

type ChapterLink = { id: string; title: string; isFree: boolean };

interface ChapterNavProps {
  courseId: string;
  prev: ChapterLink | null;
  next: ChapterLink | null;
  isPurchased: boolean;
}

const NavCard = ({
  href,
  direction,
  chapter,
  locked,
}: {
  href: string;
  direction: "prev" | "next";
  chapter: ChapterLink;
  locked: boolean;
}) => {
  const isNext = direction === "next";
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-0 flex-1 items-center gap-x-3 rounded-xl border border-ink-200 bg-white p-3 transition hover:border-brand-300 hover:bg-brand-50/40 sm:p-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30",
        isNext && "flex-row-reverse text-right"
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-600 transition group-hover:bg-brand-100 group-hover:text-brand-700">
        {isNext ? <ChevronRight className="h-5 w-5" aria-hidden /> : <ChevronLeft className="h-5 w-5" aria-hidden />}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-ink-500">
          {isNext ? "Next chapter" : "Previous chapter"}
        </span>
        <span className={cn("flex items-center gap-x-1 text-sm font-medium text-ink-900", isNext && "justify-end")}>
          {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-label="Locked" />}
          <span className="truncate">{chapter.title}</span>
        </span>
      </span>
    </Link>
  );
};

/** Previous / next chapter navigation; stacks on narrow screens. */
export const ChapterNav = ({ courseId, prev, next, isPurchased }: ChapterNavProps) => {
  if (!prev && !next) return null;

  return (
    <nav aria-label="Chapter navigation" className="flex flex-col gap-3 sm:flex-row">
      {prev ? (
        <NavCard
          href={`/courses/${courseId}/chapters/${prev.id}`}
          direction="prev"
          chapter={prev}
          locked={!isPurchased && !prev.isFree}
        />
      ) : (
        <div className="hidden flex-1 sm:block" />
      )}
      {next && (
        <NavCard
          href={`/courses/${courseId}/chapters/${next.id}`}
          direction="next"
          chapter={next}
          locked={!isPurchased && !next.isFree}
        />
      )}
    </nav>
  );
};
