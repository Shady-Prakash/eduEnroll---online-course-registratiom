import { NavbarRoutes } from "@/components/navbar-routes";

import { CourseMobileSidebar } from "./course-mobile-sidebar";
import type { CourseWithChapters } from "./types";

interface CourseNavbarProps {
  course: CourseWithChapters;
  progressCount: number;
  isPurchased: boolean;
};

export const CourseNavbar = ({
  course,
  progressCount,
  isPurchased,
}: CourseNavbarProps) => {
  return (
    <div className="flex h-full items-center border-b border-ink-200 bg-white p-4 shadow-sm">
      <CourseMobileSidebar
        course={course}
        progressCount={progressCount}
        isPurchased={isPurchased}
      />
      <NavbarRoutes/>
    </div>
  )
}
