import { db } from "@/lib/db";
import { getCourseAccess } from "@/lib/access";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

type ChapterLink = { id: string; title: string; isFree: boolean };

const EMPTY = {
  chapter: null,
  course: null,
  muxData: null,
  attachments: [],
  nextChapter: null as ChapterLink | null,
  prevChapter: null as ChapterLink | null,
  chapterNumber: 0,
  chaptersTotal: 0,
  userProgress: null,
  purchase: null,
};

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    // Round 1: independent lookups in parallel.
    const [access, course, chapter, userProgress] = await Promise.all([
      // Purchase, active eduEnroll Pass enrolment, or teaching the course.
      getCourseAccess(userId, courseId),
      db.course.findUnique({
        where: { id: courseId, isPublished: true },
        select: {
          price: true,
          title: true,
          userId: true,
          code: true,
          _count: {
            select: {
              chapters: { where: { isPublished: true } },
              attachments: true,
            },
          },
        },
      }),
      // Scope the chapter to this course so a purchase of one course
      // can't unlock another course's chapter via the URL.
      db.chapter.findUnique({
        where: { id: chapterId, courseId, isPublished: true },
      }),
      db.userProgress.findUnique({
        where: { userId_chapterId: { userId, chapterId } },
      }),
    ]);

    if (!chapter || !course) {
      return EMPTY;
    }

    const purchase = access.hasAccess ? { via: access.via } : null;

    const canWatch = chapter.isFree || !!purchase;

    // Round 2: queries that depend on access, also in parallel.
    const [attachments, muxData, siblings] = await Promise.all([
      purchase
        ? db.attachment.findMany({ where: { courseId } })
        : Promise.resolve([]),
      canWatch
        ? db.muxData.findUnique({ where: { chapterId } })
        : Promise.resolve(null),
      // Lightweight list of published chapters: gives "Chapter X of N" and prev/next.
      db.chapter.findMany({
        where: { courseId, isPublished: true },
        select: { id: true, title: true, isFree: true },
        orderBy: { position: "asc" },
      }),
    ]);

    const index = siblings.findIndex((c) => c.id === chapter.id);
    const nextChapter = siblings[index + 1] ?? null;
    const prevChapter = index > 0 ? siblings[index - 1] : null;

    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      prevChapter,
      chapterNumber: index + 1,
      chaptersTotal: siblings.length,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return EMPTY;
  }
}
