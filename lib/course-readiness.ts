import { parseOutcomes } from "@/lib/validations/course";
import { hasRichContent } from "@/lib/rich-text";

type CourseLike = {
  title: string;
  code?: string | null;
  subtitle?: string | null;
  level?: string | null;
  outcomes?: unknown;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  price: number | null;
  chapters: { isPublished: boolean }[];
};

export type ReadinessItem = {
  id: string;          // matches the section anchor on the setup page
  label: string;
  done: boolean;
  required: boolean;
};

const hasText = hasRichContent;

/**
 * Single source of truth for "can this course be published?"
 * Used by the publish API and the course-setup checklist.
 */
export const getCourseReadiness = (course: CourseLike) => {
  const items: ReadinessItem[] = [
    { id: "basics", label: "Course title", done: course.title.trim().length >= 3, required: true },
    { id: "description", label: "Description", done: hasText(course.description), required: true },
    { id: "media", label: "Cover image", done: !!course.imageUrl, required: true },
    { id: "basics", label: "Category", done: !!course.categoryId, required: true },
    { id: "pricing", label: "Price (or free)", done: course.price !== null, required: true },
    { id: "curriculum", label: "At least 1 published chapter", done: course.chapters.some((c) => c.isPublished), required: true },
    { id: "basics", label: "Unit code", done: !!course.code, required: false },
    { id: "basics", label: "Subtitle", done: !!course.subtitle, required: false },
    { id: "basics", label: "Level", done: !!course.level, required: false },
    { id: "outcomes", label: "Learning outcomes", done: parseOutcomes(course.outcomes).length >= 2, required: false },
  ];

  const required = items.filter((i) => i.required);
  const missing = required.filter((i) => !i.done);

  return {
    items,
    requiredDone: required.length - missing.length,
    requiredTotal: required.length,
    totalDone: items.filter((i) => i.done).length,
    total: items.length,
    missing,
    canPublish: missing.length === 0,
  };
};
