import { Chapter, Course, UserProgress } from "@prisma/client";

export type CourseWithChapters = Course & {
  sections?: { id: string; title: string }[];
  chapters: (Chapter & {
    userProgress: UserProgress[] | null;
  })[];
};
