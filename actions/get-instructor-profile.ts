import { db } from "@/lib/db";
import { getUserProfiles } from "@/lib/clerk-users";
import { getCourseRatings, getInstructorStats } from "@/lib/reviews";
import { getPricing } from "@/lib/pricing";

/**
 * Everything for the public instructor page. Returns null when the user is
 * neither a teacher of any published course nor has a teacher profile.
 */
export const getInstructorProfile = async (instructorId: string, viewerId: string) => {
  const [profileRow, courses, people] = await Promise.all([
    db.teacherProfile.findUnique({ where: { userId: instructorId } }),
    db.course.findMany({
      where: { isPublished: true, OR: [{ userId: instructorId }, { instructors: { some: { userId: instructorId } } }] },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        title: true,
        code: true,
        level: true,
        imageUrl: true,
        price: true,
        salePrice: true,
        saleEndsAt: true,
        category: { select: { name: true } },
        _count: { select: { chapters: { where: { isPublished: true } } } },
        purchases: { where: { userId: viewerId }, select: { id: true } },
      },
    }),
    getUserProfiles([instructorId]),
  ]);

  const person = people.get(instructorId);
  if (!courses.length && !profileRow) return null;

  const ids = courses.map((c) => c.id);
  const [ratings, stats, recent] = await Promise.all([
    getCourseRatings(ids),
    getInstructorStats([instructorId]),
    ids.length
      ? db.review.findMany({
          where: { courseId: { in: ids }, comment: { not: null } },
          orderBy: { updatedAt: "desc" },
          take: 9,
          select: { id: true, userId: true, rating: true, comment: true, updatedAt: true, course: { select: { id: true, title: true } } },
        })
      : Promise.resolve([]),
  ]);
  const authors = await getUserProfiles(recent.map((r) => r.userId));

  return {
    id: instructorId,
    name: person?.name ?? "KOI teacher",
    imageUrl: person?.imageUrl ?? null,
    headline: profileRow?.headline ?? null,
    bio: profileRow?.bio ?? null,
    website: profileRow?.website ?? null,
    linkedin: profileRow?.linkedin ?? null,
    isYou: instructorId === viewerId,
    stats: stats.get(instructorId) ?? { rating: 0, reviews: 0, students: 0, courses: 0 },
    courses: courses.map((c) => {
      const pricing = getPricing(c);
      return {
        id: c.id,
        title: c.title,
        code: c.code,
        level: c.level,
        imageUrl: c.imageUrl,
        category: c.category?.name ?? null,
        chapters: c._count.chapters,
        price: pricing.current,
        originalPrice: pricing.onSale ? pricing.original : null,
        rating: ratings.get(c.id)?.average ?? 0,
        ratingCount: ratings.get(c.id)?.count ?? 0,
        role: c.userId === instructorId ? ("owner" as const) : ("co" as const),
        enrolled: c.purchases.length > 0,
      };
    }),
    reviews: recent.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment!,
      updatedAt: r.updatedAt,
      author: authors.get(r.userId)?.name ?? "eduEnroll student",
      authorImage: authors.get(r.userId)?.imageUrl ?? null,
      course: r.course,
    })),
  };
};

export type InstructorProfile = NonNullable<Awaited<ReturnType<typeof getInstructorProfile>>>;
