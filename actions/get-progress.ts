import { db } from "@/lib/db";

export const getProgress = async (
  userId: string,
  courseId: string,
): Promise<number> => {
  try {
    const publishedChapters = await db.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true,
      },
      select: {
        id: true,
      }
    });

    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

    if (!publishedChapterIds.length) {
      return 0;
    }

    const validCompletedChapters = await db.userProgress.count({
      where: {
        userId: userId,
        chapterId: {
          in: publishedChapterIds,
        },
        isCompleted: true,
      }
    });

    const progressPercentage = (validCompletedChapters / publishedChapterIds.length) * 100;

    return progressPercentage;
  } catch (error) {
    console.log("[GET_PROGRESS]", error);
    return 0;
  }
}
/**
 * Progress (0–100) for many courses with a single query, instead of
 * calling getProgress() once per course (N+1 queries).
 */
export const getProgressForCourses = async (
  userId: string,
  courses: { id: string; chapters: { id: string }[] }[],
): Promise<Map<string, number>> => {
  const result = new Map<string, number>();
  const chapterIds = courses.flatMap((c) => c.chapters.map((ch) => ch.id));

  if (!chapterIds.length) {
    courses.forEach((c) => result.set(c.id, 0));
    return result;
  }

  try {
    const completed = await db.userProgress.findMany({
      where: { userId, isCompleted: true, chapterId: { in: chapterIds } },
      select: { chapterId: true },
    });
    const done = new Set(completed.map((p) => p.chapterId));

    courses.forEach((c) => {
      const total = c.chapters.length;
      const finished = c.chapters.filter((ch) => done.has(ch.id)).length;
      result.set(c.id, total ? (finished / total) * 100 : 0);
    });
  } catch (error) {
    console.log("[GET_PROGRESS_FOR_COURSES]", error);
    courses.forEach((c) => result.set(c.id, 0));
  }

  return result;
}
