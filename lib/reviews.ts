import { db } from "@/lib/db";

export type RatingSummary = { average: number; count: number };

/** Average rating + review count per course (one query). */
export const getCourseRatings = async (courseIds: string[]) => {
  const map = new Map<string, RatingSummary>();
  if (!courseIds.length) return map;
  const rows = await db.review.groupBy({
    by: ["courseId"],
    where: { courseId: { in: courseIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  rows.forEach((r) => map.set(r.courseId, { average: r._avg.rating ?? 0, count: r._count._all }));
  return map;
};

export type InstructorStats = { rating: number; reviews: number; students: number; courses: number };

/**
 * Udemy-style instructor stats across EVERY published course they teach
 * (owned or co-taught): average rating, total reviews, unique students, courses.
 */
export const getInstructorStats = async (userIds: string[]) => {
  const result = new Map<string, InstructorStats>();
  await Promise.all(
    Array.from(new Set(userIds)).map(async (userId) => {
      const courses = await db.course.findMany({
        where: { isPublished: true, OR: [{ userId }, { instructors: { some: { userId } } }] },
        select: { id: true },
      });
      const ids = courses.map((c) => c.id);
      if (!ids.length) {
        result.set(userId, { rating: 0, reviews: 0, students: 0, courses: 0 });
        return;
      }
      const [agg, students] = await Promise.all([
        db.review.aggregate({ where: { courseId: { in: ids } }, _avg: { rating: true }, _count: { _all: true } }),
        db.purchase.findMany({ where: { courseId: { in: ids } }, select: { userId: true }, distinct: ["userId"] }),
      ]);
      result.set(userId, {
        rating: agg._avg.rating ?? 0,
        reviews: agg._count._all,
        students: students.length,
        courses: ids.length,
      });
    })
  );
  return result;
};
