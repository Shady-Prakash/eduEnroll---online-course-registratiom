import { db } from "@/lib/db";
import { parseOutcomes } from "@/lib/validations/course";
import { ensureChapterDurations } from "@/lib/mux";
import { getCourseAccess } from "@/lib/access";
import { getPricing } from "@/lib/pricing";
import { getUserProfiles } from "@/lib/clerk-users";
import { getInstructorStats } from "@/lib/reviews";

/** Plain-text teaser of a lecture's rich-text description (optional). */
const toExcerpt = (html: string | null) => {
  const text = html?.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  if (!text) return null;
  return text.length > 280 ? `${text.slice(0, 277).trimEnd()}…` : text;
};

export type CourseDetails = NonNullable<Awaited<ReturnType<typeof getCourseDetails>>>;

/**
 * Everything the course details (landing) page needs, fetched in parallel.
 * Published courses are visible to everyone signed in; drafts only to their owner.
 */
export const getCourseDetails = async (courseId: string, userId: string) => {
  const [course, access, completed, reviewAgg, reviewBuckets, recentReviews, publishedCount] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      include: {
        category: { select: { name: true } },
        chapters: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            isFree: true,
            position: true,
            description: true,
            duration: true,
            sectionId: true,
            muxData: { select: { playbackId: true, assetId: true } },
          },
          orderBy: { position: "asc" },
        },
        sections: { orderBy: { position: "asc" }, select: { id: true, title: true } },
        instructors: { select: { userId: true }, orderBy: { createdAt: "asc" } },
        _count: { select: { attachments: true, purchases: true } },
      },
    }),
    getCourseAccess(userId, courseId),
    db.userProgress.findMany({
      where: { userId, isCompleted: true, chapter: { courseId } },
      select: { chapterId: true },
    }),
    db.review.aggregate({ where: { courseId }, _avg: { rating: true }, _count: { _all: true } }),
    db.review.groupBy({ by: ["rating"], where: { courseId }, _count: { _all: true } }),
    db.review.findMany({
      where: { courseId },
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: { id: true, userId: true, rating: true, comment: true, updatedAt: true },
    }),
    db.course.count({ where: { isPublished: true } }),
  ]);

  if (!course || (!course.isPublished && course.userId !== userId)) return null;

  const teacherIds = [course.userId, ...course.instructors.map((i) => i.userId)];
  const [durations, profiles, stats, myReview] = await Promise.all([
    ensureChapterDurations(course.chapters),
    getUserProfiles([...teacherIds, ...recentReviews.map((r) => r.userId)]),
    getInstructorStats(teacherIds),
    db.review.findUnique({ where: { courseId_userId: { courseId, userId } }, select: { rating: true, comment: true } }),
  ]);

  const instructors = teacherIds.map((id) => ({
    id,
    name: profiles.get(id)?.name ?? "KOI teacher",
    imageUrl: profiles.get(id)?.imageUrl ?? null,
    role: id === course.userId ? ("owner" as const) : ("co" as const),
    stats: stats.get(id) ?? { rating: 0, reviews: 0, students: 0, courses: 0 },
  }));

  const ratingCount = reviewAgg._count._all;
  const ratings = {
    average: reviewAgg._avg.rating ?? 0,
    count: ratingCount,
    // Share of reviews per star (5 → 1), for the breakdown bars.
    breakdown: [5, 4, 3, 2, 1].map((star) => {
      const n = reviewBuckets.find((b) => b.rating === star)?._count._all ?? 0;
      return { star, count: n, pct: ratingCount ? Math.round((n / ratingCount) * 100) : 0 };
    }),
  };
  const reviews = recentReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    updatedAt: r.updatedAt,
    author: profiles.get(r.userId)?.name ?? "eduEnroll student",
    authorImage: profiles.get(r.userId)?.imageUrl ?? null,
    isMine: r.userId === userId,
  }));
  const done = new Set(completed.map((c) => c.chapterId));
  // Never send playback IDs of locked chapters to the browser.
  const chapters = course.chapters.map(({ muxData, description, ...ch }) => ({
    ...ch,
    duration: durations.get(ch.id) ?? null,
    excerpt: toExcerpt(description),
    isCompleted: done.has(ch.id),
  }));

  // Group lectures into sections (lectures without a section go first, as "General").
  const known = new Set(course.sections.map((s) => s.id));
  const loose = chapters.filter((c) => !c.sectionId || !known.has(c.sectionId));
  const sections = [
    ...(loose.length ? [{ id: "general", title: course.sections.length ? "General" : "Course lectures", chapters: loose }] : []),
    ...course.sections.map((s) => ({ id: s.id, title: s.title, chapters: chapters.filter((c) => c.sectionId === s.id) })),
  ]
    .filter((s) => s.chapters.length > 0)
    .map((s) => ({ ...s, duration: s.chapters.reduce((sum, c) => sum + (c.duration ?? 0), 0) }));
  const totalDuration = chapters.reduce((sum, c) => sum + (c.duration ?? 0), 0);
  const previews = course.chapters
    .filter((ch) => ch.isFree && ch.muxData?.playbackId)
    .map((ch) => ({ id: ch.id, title: ch.title, playbackId: ch.muxData!.playbackId! }));
  const completedCount = chapters.filter((c) => c.isCompleted).length;
  const nextChapter = chapters.find((c) => !c.isCompleted) ?? chapters[0] ?? null;
  const firstPreview = chapters.find((c) => c.isFree) ?? null;

  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    code: course.code,
    term: course.term,
    level: course.level,
    description: course.description,
    imageUrl: course.imageUrl,
    price: course.price,
    pricing: getPricing(course),
    category: course.category?.name ?? null,
    categoryId: course.categoryId,
    isPublished: course.isPublished,
    isOwner: course.userId === userId,
    updatedAt: course.updatedAt,
    outcomes: parseOutcomes(course.outcomes),
    attachmentsCount: course._count.attachments,
    studentsCount: course._count.purchases,
    instructor: instructors[0]?.name ?? null,
    instructors,
    chapters,
    isEnrolled: access.hasAccess,
    accessVia: access.via,
    hasActivePass: !!access.subscription,
    passExpired: access.passExpired,
    publishedCount,
    ratings,
    reviews,
    myReview,
    canReview: access.hasAccess && access.via !== "instructor",
    progress: chapters.length ? Math.round((completedCount / chapters.length) * 100) : 0,
    completedCount,
    nextChapter,
    firstPreview,
    previews,
    sections,
    totalDuration,
  };
};
