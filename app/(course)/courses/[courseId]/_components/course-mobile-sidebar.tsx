import { ListVideo } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { CourseSidebar } from "./course-sidebar";
import type { CourseWithChapters } from "./types";

interface CourseMobileSidebarProps {
  course: CourseWithChapters;
  progressCount: number;
  isPurchased: boolean;
};

/** Labelled "Chapters" button (not a bare hamburger) so the chapter list is discoverable on phones. */
export const CourseMobileSidebar = ({
  course,
  progressCount,
  isPurchased,
}: CourseMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger
        className="mr-3 inline-flex h-10 items-center gap-x-2 rounded-md border border-ink-200 px-3 text-sm font-medium text-ink-700 transition hover:bg-ink-50 md:hidden"
        aria-label="Open chapter list"
      >
        <ListVideo className="h-4 w-4" aria-hidden />
        Chapters
        {isPurchased && (
          <span className="rounded-full bg-brand-100 px-1.5 text-xs font-semibold tabular-nums text-brand-800">
            {Math.round(progressCount)}%
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-xs bg-white p-0">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
          isPurchased={isPurchased}
        />
      </SheetContent>
    </Sheet>
  )
}
